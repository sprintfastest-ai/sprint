import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import pool from '@/db/pool';

export async function getLinkedAthletes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parentId = req.user?.userId;
    if (!parentId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { rows } = await pool.query(
      `SELECT u.id, u.email, ap.*
       FROM parent_profiles pp
       JOIN parent_athlete_links pal ON pal.parent_id = pp.id AND pal.status = 'active'
       JOIN athlete_profiles ap ON ap.id = pal.athlete_id
       JOIN users u ON u.id = ap.user_id
       WHERE pp.user_id = $1`,
      [parentId],
    );
    sendSuccess(res, rows);
  } catch (err) {
    next(err);
  }
}

export async function getAthleteProgress(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parentId = req.user?.userId;
    const { athleteId } = req.params as { athleteId: string };

    // Verify the parent is linked to this athlete
    const { rows: link } = await pool.query(
      `SELECT 1 FROM parent_profiles pp
       JOIN parent_athlete_links pal ON pal.parent_id = pp.id
       WHERE pp.user_id = $1 AND pal.athlete_id = $2 AND pal.status = 'active'`,
      [parentId, athleteId],
    );
    if (!link.length) {
      throw new AppError('Forbidden', ERROR_CODES.FORBIDDEN, 403);
    }

    const [sessions, pbs, diagnoses] = await Promise.all([
      pool.query(
        'SELECT * FROM sessions WHERE athlete_id = $1 ORDER BY completed_at DESC LIMIT 20',
        [athleteId],
      ),
      pool.query(
        `SELECT athlete_id AS "athleteId", distance_metres AS distance, time_seconds AS "timeSeconds", recorded_at AS "recordedAt"
         FROM personal_bests WHERE athlete_id = $1 AND is_current_pb = TRUE ORDER BY distance_metres ASC`,
        [athleteId],
      ),
      pool.query(
        'SELECT * FROM diagnoses WHERE athlete_id = $1 ORDER BY created_at DESC LIMIT 5',
        [athleteId],
      ),
    ]);

    sendSuccess(res, {
      sessions: sessions.rows,
      personalBests: pbs.rows,
      diagnoses: diagnoses.rows,
    });
  } catch (err) {
    next(err);
  }
}
