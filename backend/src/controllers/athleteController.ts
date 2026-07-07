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
import { generateWeeklyPlan, runDiagnosis } from '@/services/ai';
import pool from '@/db/pool';
import type { PersonalBest, WeaknessType } from '@/types';

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
      } | undefined;

      if (!profile) {
        throw new AppError('Athlete profile not found', ERROR_CODES.NOT_FOUND, 404);
      }

      const generated = await generateWeeklyPlan(
        athleteId,
        profile.age_group,
        profile.weakness_type,
        profile.training_days_per_week,
        weekStartDate,
      );
      plan = await insertPlan(generated);
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

    const { planId, timesRecorded } = req.body as {
      planId: string;
      timesRecorded: PersonalBest[];
    };

    const session = await insertSession(athleteId, planId, timesRecorded);

    // Upsert PBs concurrently
    await Promise.allSettled(timesRecorded.map((pb) => upsertPersonalBest(pb)));

    sendSuccess(res, session, 201);
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

    // Get most recent diagnosis for context
    const { rows: prev } = await pool.query(
      `SELECT weakness_type FROM diagnoses
       WHERE athlete_id = $1
       ORDER BY diagnosed_at DESC LIMIT 1`,
      [athleteId],
    );
    const previousWeaknessType = (prev[0]?.weakness_type as WeaknessType) ?? undefined;

    const result = await runDiagnosis(
      athleteId,
      timeTrial20m,
      timeTrial60m,
      timeTrial200m,
      previousWeaknessType,
    );

    const { rows } = await pool.query(
      `INSERT INTO diagnoses (athlete_id, weakness_type, drill_prescription)
       VALUES ($1, $2, $3) RETURNING *`,
      [athleteId, result.weaknessType, JSON.stringify(result.drillPrescription)],
    );

    // Update athlete profile weakness type
    await pool.query(
      'UPDATE athlete_profiles SET weakness_type = $1 WHERE user_id = $2',
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
      'SELECT * FROM diagnoses WHERE athlete_id = $1 ORDER BY diagnosed_at DESC',
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
              u.email, u.role
       FROM athlete_profiles ap
       JOIN users u ON u.id = ap.user_id
       WHERE ap.user_id = $1 LIMIT 1`,
      [userId],
    );
    if (!rows.length) throw new AppError('Profile not found', ERROR_CODES.NOT_FOUND, 404);
    sendSuccess(res, rows[0]);
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

    const { ageGroup, primaryEvent, trainingDaysPerWeek } = req.body as {
      ageGroup?: string;
      primaryEvent?: string;
      trainingDaysPerWeek?: number;
    };

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (ageGroup !== undefined) { updates.push(`age_group = $${idx++}`); values.push(ageGroup); }
    if (primaryEvent !== undefined) { updates.push(`primary_event = $${idx++}`); values.push(primaryEvent); }
    if (trainingDaysPerWeek !== undefined) { updates.push(`training_days_per_week = $${idx++}`); values.push(trainingDaysPerWeek); }

    if (!updates.length) throw new AppError('Nothing to update', ERROR_CODES.VALIDATION_ERROR, 400);

    values.push(userId);
    const { rows } = await pool.query(
      `UPDATE athlete_profiles SET ${updates.join(', ')}
       WHERE user_id = $${idx}
       RETURNING id AS "athleteId", age_group AS "ageGroup", primary_event AS "primaryEvent",
                 weakness_type AS "weaknessType", training_days_per_week AS "trainingDaysPerWeek"`,
      values,
    );
    if (!rows.length) throw new AppError('Profile not found', ERROR_CODES.NOT_FOUND, 404);
    sendSuccess(res, rows[0]);
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
