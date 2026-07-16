import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import pool from '@/db/pool';
import { insertPlan } from '@/db/queries/training';
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

export async function getLinkedAthletes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { coachId } = req.params as { coachId: string };
    assertIsCoach(req, coachId);

    const { rows } = await pool.query(
      `SELECT u.id, u.email, u.role, ap.*
       FROM coach_profiles cp
       JOIN coach_athlete_links cal ON cal.coach_id = cp.id AND cal.status = 'active'
       JOIN athlete_profiles ap ON ap.id = cal.athlete_id
       JOIN users u ON u.id = ap.user_id
       WHERE cp.user_id = $1`,
      [coachId],
    );
    sendSuccess(res, rows);
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

    const { rows } = await pool.query(
      `INSERT INTO coach_notes (coach_id, athlete_id, content, is_visible_to_athlete)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [coachId, athleteId, content, isVisibleToAthlete],
    );
    sendSuccess(res, rows[0], 201);
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

    const { rows } = await pool.query(
      `SELECT * FROM coach_notes
       WHERE coach_id = $1 AND athlete_id = $2
       ORDER BY created_at DESC`,
      [coachId, athleteId],
    );
    sendSuccess(res, rows);
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
