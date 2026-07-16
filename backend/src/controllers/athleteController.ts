import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import {
  getPlanByAthleteAndWeek,
  insertSession,
  getSessionsByAthlete,
  getPersonalBestsByAthlete,
  upsertPersonalBest,
  insertPlan,
} from '@/db/queries/training';
import { recordSessionCompletion, checkAndUnlockBadges, getAchievements as getAchievementsQuery } from '@/db/queries/athletes';
import { generateWeeklyPlan, runDiagnosis } from '@/services/ai';
import { isPremium } from '@/db/queries/subscriptions';
import pool from '@/db/pool';
import type { PersonalBest, WeaknessType } from '@/types';

/** Monday-start ISO date (YYYY-MM-DD) of the week containing `date`. */
function currentWeekStartDate(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().slice(0, 10);
}

export async function getWeeklyPlan(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId } = req.params as { athleteId: string };
    const { weekStartDate } = req.query as { weekStartDate: string };

    // Only the athlete themselves or their coach/parent can fetch
    assertCanAccessAthlete(req, athleteId);

    const userId = req.user?.userId;
    const premium = userId ? await isPremium(userId) : false;

    // Free tier: only the current week's plan is available — past/future
    // weeks (planning ahead or reviewing history) require Premium.
    if (!premium && req.user?.role === 'athlete' && weekStartDate !== currentWeekStartDate()) {
      throw new AppError(
        'Free plan includes this week only. Upgrade to Premium to plan ahead or review past weeks.',
        ERROR_CODES.PREMIUM_REQUIRED,
        402,
      );
    }

    let plan = await getPlanByAthleteAndWeek(athleteId, weekStartDate);

    if (!plan) {
      // Generate on-demand if no plan exists yet
      const { rows } = await pool.query(
        'SELECT * FROM athlete_profiles WHERE id = $1',
        [athleteId],
      );
      const profile = rows[0] as {
        age_group: string;
        weakness_type: WeaknessType | null;
        training_days_per_week: number;
        next_race_date: string | null;
      } | undefined;

      if (!profile) {
        throw new AppError('Athlete profile not found', ERROR_CODES.NOT_FOUND, 404);
      }

      // Taper week: the athlete has a race within 7 days of this plan's week
      // start. Automatic taper is a Premium perk — free users train as normal.
      let isTaperWeek = false;
      if (premium && profile.next_race_date) {
        const daysUntilRace = Math.floor(
          (new Date(profile.next_race_date).getTime() - new Date(weekStartDate).getTime())
            / (24 * 60 * 60 * 1000),
        );
        isTaperWeek = daysUntilRace >= 0 && daysUntilRace <= 7;
      }

      const generated = await generateWeeklyPlan(
        athleteId,
        profile.age_group,
        profile.weakness_type,
        profile.training_days_per_week ?? 3,
        weekStartDate,
        isTaperWeek,
      );
      // Trust server-known values for identity/flags; take only `days` from Gemini
      plan = await insertPlan({
        athleteId,
        weekStartDate,
        days: Array.isArray(generated?.days) ? generated.days : [],
        isCoachOverride: false,
        isTaperWeek,
      });
    }

    sendSuccess(res, plan);
  } catch (err) {
    next(err);
  }
}

export async function completeSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId } = req.params as { athleteId: string };
    assertCanAccessAthlete(req, athleteId);

    const { planId, timesRecorded, dayNumber } = req.body as {
      planId: string;
      timesRecorded: PersonalBest[];
      dayNumber?: number;
    };

    const session = await insertSession(athleteId, planId, timesRecorded, dayNumber);

    // Upsert PBs concurrently
    await Promise.allSettled(timesRecorded.map((pb) => upsertPersonalBest(pb)));

    await recordSessionCompletion(athleteId, new Date());
    const newBadges = await checkAndUnlockBadges(athleteId);

    sendSuccess(res, { ...session, newBadges }, 201);
  } catch (err) {
    next(err);
  }
}

export async function getSessionHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId } = req.params as { athleteId: string };
    assertCanAccessAthlete(req, athleteId);
    const sessions = await getSessionsByAthlete(athleteId);
    sendSuccess(res, sessions);
  } catch (err) {
    next(err);
  }
}

export async function getPersonalBests(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId } = req.params as { athleteId: string };
    assertCanAccessAthlete(req, athleteId);
    const pbs = await getPersonalBestsByAthlete(athleteId);
    sendSuccess(res, pbs);
  } catch (err) {
    next(err);
  }
}

export async function diagnose(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId, timeTrial20m, timeTrial60m, timeTrial200m } =
      req.body as {
        athleteId: string;
        timeTrial20m: number;
        timeTrial60m: number;
        timeTrial200m: number;
      };

    assertCanAccessAthlete(req, athleteId);

    const userId = req.user?.userId;
    if (userId && !(await isPremium(userId))) {
      const { rows: countRows } = await pool.query<{ count: number }>(
        'SELECT COUNT(*)::int AS count FROM diagnoses WHERE athlete_id = $1',
        [athleteId],
      );
      if ((countRows[0]?.count ?? 0) >= 1) {
        throw new AppError(
          'Free plan includes one diagnosis. Upgrade to Premium to retake your weakness assessment.',
          ERROR_CODES.PREMIUM_REQUIRED,
          402,
        );
      }
    }

    // Get most recent diagnosis for context
    const { rows: prev } = await pool.query(
      `SELECT weakness_type, id FROM diagnoses
       WHERE athlete_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [athleteId],
    );
    const previousWeaknessType = (prev[0]?.weakness_type as WeaknessType) ?? undefined;
    const previousDiagnosisId = (prev[0]?.id as string) ?? null;

    const result = await runDiagnosis(
      athleteId,
      timeTrial20m,
      timeTrial60m,
      timeTrial200m,
      previousWeaknessType,
    );

    const { rows } = await pool.query(
      `INSERT INTO diagnoses (athlete_id, weakness_type, answers, drill_prescription, previous_diagnosis_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING
         id, athlete_id AS "athleteId", weakness_type AS "weaknessType",
         answers, drill_prescription AS "drillPrescription",
         previous_diagnosis_id AS "previousDiagnosisId",
         created_at AS "diagnosedAt"`,
      [
        athleteId,
        result.weaknessType,
        JSON.stringify((req.body as { answers?: object }).answers ?? {}),
        JSON.stringify(result.drillPrescription),
        previousDiagnosisId,
      ],
    );

    // Update athlete profile weakness type + diagnosis timestamp
    await pool.query(
      'UPDATE athlete_profiles SET weakness_type = $1, weakness_diagnosed_at = NOW() WHERE id = $2',
      [result.weaknessType, athleteId],
    );

    sendSuccess(res, rows[0], 201);
  } catch (err) {
    next(err);
  }
}

export async function getDiagnosisHistory(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId } = req.params as { athleteId: string };
    assertCanAccessAthlete(req, athleteId);
    const { rows } = await pool.query(
      `SELECT
         id, athlete_id AS "athleteId", weakness_type AS "weaknessType",
         answers, drill_prescription AS "drillPrescription",
         previous_diagnosis_id AS "previousDiagnosisId",
         created_at AS "diagnosedAt"
       FROM diagnoses WHERE athlete_id = $1 ORDER BY created_at DESC`,
      [athleteId],
    );
    sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
}

export async function logPersonalBest(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId } = req.params as { athleteId: string };
    assertCanAccessAthlete(req, athleteId);
    const { distance, timeSeconds } = req.body as { distance: number; timeSeconds: number };
    const pb: PersonalBest = { athleteId, distance, timeSeconds, recordedAt: new Date().toISOString() };
    await upsertPersonalBest(pb);
    const pbs = await getPersonalBestsByAthlete(athleteId);
    sendSuccess(res, pbs, 201);
  } catch (err) {
    next(err);
  }
}

export async function getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { rows } = await pool.query(
      `SELECT ap.id AS "athleteId", ap.age_group AS "ageGroup", ap.primary_event AS "primaryEvent",
              ap.weakness_type AS "weaknessType", ap.training_days_per_week AS "trainingDaysPerWeek",
              ap.next_race_date AS "nextRaceDate", ap.weakness_diagnosed_at AS "weaknessDiagnosedAt",
              ap.streak_count AS "streakCount", ap.longest_streak AS "longestStreak",
              ap.onboarding_completed AS "onboardingCompleted",
              u.email, u.role
       FROM athlete_profiles ap
       JOIN users u ON u.id = ap.user_id
       WHERE ap.user_id = $1 LIMIT 1`,
      [userId],
    );
    if (!rows.length) throw new AppError('Profile not found', ERROR_CODES.NOT_FOUND, 404);

    const profile = rows[0] as { weaknessDiagnosedAt: string | null };
    const needsRediagnosis = !profile.weaknessDiagnosedAt
      || (Date.now() - new Date(profile.weaknessDiagnosedAt).getTime()) > 28 * 24 * 60 * 60 * 1000;

    sendSuccess(res, { ...profile, needsRediagnosis });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { ageGroup, primaryEvent, events, trainingDaysPerWeek, nextRaceDate, onboardingCompleted } = req.body as {
      ageGroup?: string;
      primaryEvent?: string;
      events?: string[];
      trainingDaysPerWeek?: number;
      nextRaceDate?: string | null;
      onboardingCompleted?: boolean;
    };

    // `events` (array, from onboarding) is stored joined into the single
    // `primary_event` column, matching the existing profile-pill convention.
    const primaryEventValue = events !== undefined ? events.join(',') : primaryEvent;

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (ageGroup !== undefined) { updates.push(`age_group = $${idx++}`); values.push(ageGroup); }
    if (primaryEventValue !== undefined) { updates.push(`primary_event = $${idx++}`); values.push(primaryEventValue); }
    if (trainingDaysPerWeek !== undefined) { updates.push(`training_days_per_week = $${idx++}`); values.push(trainingDaysPerWeek); }
    if (nextRaceDate !== undefined) { updates.push(`next_race_date = $${idx++}`); values.push(nextRaceDate); }
    if (onboardingCompleted !== undefined) { updates.push(`onboarding_completed = $${idx++}`); values.push(onboardingCompleted); }

    if (!updates.length) throw new AppError('Nothing to update', ERROR_CODES.VALIDATION_ERROR, 400);

    values.push(userId);
    const { rows } = await pool.query(
      `UPDATE athlete_profiles SET ${updates.join(', ')}
       WHERE user_id = $${idx}
       RETURNING id AS "athleteId", age_group AS "ageGroup", primary_event AS "primaryEvent",
                 weakness_type AS "weaknessType", training_days_per_week AS "trainingDaysPerWeek",
                 next_race_date AS "nextRaceDate", onboarding_completed AS "onboardingCompleted"`,
      values,
    );
    if (!rows.length) throw new AppError('Profile not found', ERROR_CODES.NOT_FOUND, 404);
    sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function getAchievements(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId } = req.params as { athleteId: string };
    assertCanAccessAthlete(req, athleteId);
    const rows = await getAchievementsQuery(athleteId);
    const achievements = rows.map((r) => ({
      id: r.id,
      athleteId: r.athlete_id,
      badgeType: r.badge_type,
      metadata: r.metadata,
      unlockedAt: r.unlocked_at,
    }));
    sendSuccess(res, achievements);
  } catch (err) {
    next(err);
  }
}

// ─── Guard ────────────────────────────────────────────────────────────────────

function assertCanAccessAthlete(req: Request, athleteId: string): void {
  const { role, userId: sub, athleteId: tokenAthleteId } = req.user ?? {};
  if (role === 'admin') return;
  // athlete_profiles.id is stored as athleteId in the JWT; userId is the users table id
  if (role === 'athlete' && (tokenAthleteId === athleteId || sub === athleteId)) return;
  if (role === 'coach' || role === 'parent') return;
  throw new AppError('Forbidden', ERROR_CODES.FORBIDDEN, 403);
}
