import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import pool from '@/db/pool';
import { insertPlan } from '@/db/queries/training';
import type { TrainingDay } from '@/types';

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
       JOIN LATERAL UNNEST(cp.linked_athlete_ids) AS lid(athlete_id) ON TRUE
       JOIN users u ON u.id = lid.athlete_id
       LEFT JOIN athlete_profiles ap ON ap.user_id = u.id
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

    const coachId = req.user?.sub;
    if (!coachId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

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
    const coachId = req.user?.sub;
    if (!coachId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

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
    const { coachId, athleteId } = req.params as {
      coachId: string;
      athleteId: string;
    };
    assertIsCoach(req, coachId);

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
  const { role, sub } = req.user ?? {};
  if (role === 'admin') return;
  if (role === 'coach' && sub === coachId) return;
  throw new AppError('Forbidden', ERROR_CODES.FORBIDDEN, 403);
}
