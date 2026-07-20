import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import pool from '@/db/pool';
import { insertPlan } from '@/db/queries/training';
import {
  getLinkedAthletes as getLinkedAthletesQuery,
  createCoachNote,
  getNotesByCoachAndAthlete,
  updateCoachProfile as updateCoachProfileQuery,
  findCoachProfileByUserId,
} from '@/db/queries/coaches';
import type { TrainingDay } from '@/types';

/**
 * `coachId` route params / JWT `userId` are `users.id` — every coach-owned
 * table (coach_notes, training_plans.coach_id) stores `coach_profiles.id`
 * instead. Resolve the profile id once and reuse it everywhere.
 */
async function resolveCoachProfileId(userId: string): Promise<string> {
  const { rows } = await pool.query<{ id: string }>(
    'SELECT id FROM coach_profiles WHERE user_id = $1 LIMIT 1',
    [userId],
  );
  const id = rows[0]?.id;
  if (!id) throw new AppError('Coach profile not found', ERROR_CODES.NOT_FOUND, 404);
  return id;
}

async function assertCoachLinkedToAthlete(coachProfileId: string, athleteId: string): Promise<void> {
  const { rows } = await pool.query(
    `SELECT 1 FROM coach_athlete_links
     WHERE coach_id = $1 AND athlete_id = $2 AND status = 'active' LIMIT 1`,
    [coachProfileId, athleteId],
  );
  if (!rows.length) throw new AppError('Not linked to this athlete', ERROR_CODES.FORBIDDEN, 403);
}

export async function getMyCoachProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);
    const profile = await findCoachProfileByUserId(userId);
    if (!profile) throw new AppError('Coach profile not found', ERROR_CODES.NOT_FOUND, 404);
    sendSuccess(res, {
      coachId: profile.id,
      clubName: profile.club_name,
      bio: profile.bio,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMyCoachProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);
    const coachId = await resolveCoachProfileId(userId);
    const { clubName, bio } = req.body as { clubName?: string; bio?: string };
    const updated = await updateCoachProfileQuery(coachId, {
      ...(clubName !== undefined ? { club_name: clubName } : {}),
      ...(bio !== undefined ? { bio } : {}),
    });
    sendSuccess(res, { coachId: updated?.id, clubName: updated?.club_name, bio: updated?.bio });
  } catch (err) {
    next(err);
  }
}

export async function getLinkedAthletes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { coachId } = req.params as { coachId: string };
    assertIsCoach(req, coachId);

    const coachProfileId = await resolveCoachProfileId(coachId);
    const rows = await getLinkedAthletesQuery(coachProfileId);
    const athletes = rows.map((r) => ({
      athleteId: r.athlete_profile_id,
      userId: r.user_id,
      email: r.email,
      ageGroup: r.age_group,
      primaryEvent: r.primary_event,
      weaknessType: r.weakness_type,
      streakCount: r.streak_count,
    }));
    sendSuccess(res, athletes);
  } catch (err) {
    next(err);
  }
}

export async function overridePlan(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId } = req.params as { athleteId: string };
    const { weekStartDate, days } = req.body as {
      weekStartDate: string;
      days: TrainingDay[];
    };

    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const coachId = await resolveCoachProfileId(userId);
    await assertCoachLinkedToAthlete(coachId, athleteId);

    const plan = await insertPlan({
      athleteId,
      weekStartDate,
      days,
      isCoachOverride: true,
      coachId,
    });

    sendSuccess(res, plan, 201);
  } catch (err) {
    next(err);
  }
}

export async function addNote(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { athleteId, content, isVisibleToAthlete } = req.body as {
      athleteId: string;
      content: string;
      isVisibleToAthlete: boolean;
    };
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const coachId = await resolveCoachProfileId(userId);
    await assertCoachLinkedToAthlete(coachId, athleteId);

    const note = await createCoachNote(coachId, athleteId, content, isVisibleToAthlete);
    sendSuccess(res, {
      id: note.id,
      athleteId: note.athlete_id,
      content: note.content,
      isVisibleToAthlete: note.is_visible_to_athlete,
      createdAt: note.created_at,
    }, 201);
  } catch (err) {
    next(err);
  }
}

export async function getNotes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { coachId: coachUserId, athleteId } = req.params as {
      coachId: string;
      athleteId: string;
    };
    assertIsCoach(req, coachUserId);
    const coachId = await resolveCoachProfileId(coachUserId);

    const rows = await getNotesByCoachAndAthlete(coachId, athleteId);
    const notes = rows.map((n) => ({
      id: n.id,
      athleteId: n.athlete_id,
      content: n.content,
      isVisibleToAthlete: n.is_visible_to_athlete,
      createdAt: n.created_at,
    }));
    sendSuccess(res, notes);
  } catch (err) {
    next(err);
  }
}

function assertIsCoach(req: Request, coachId: string): void {
  const { role, userId: sub } = req.user ?? {};
  if (role === 'admin') return;
  if (role === 'coach' && sub === coachId) return;
  throw new AppError('Forbidden', ERROR_CODES.FORBIDDEN, 403);
}
