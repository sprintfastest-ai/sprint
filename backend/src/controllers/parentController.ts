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
    const parentId = req.user?.sub;
    if (!parentId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { rows } = await pool.query(
      `SELECT u.id, u.email, ap.*
       FROM parent_profiles pp
       JOIN LATERAL UNNEST(pp.linked_athlete_ids) AS lid(athlete_id) ON TRUE
       JOIN users u ON u.id = lid.athlete_id
       LEFT JOIN athlete_profiles ap ON ap.user_id = u.id
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
    const parentId = req.user?.sub;
    const { athleteId } = req.params as { athleteId: string };

    // Verify the parent is linked to this athlete
    const { rows: link } = await pool.query(
      `SELECT 1 FROM parent_profiles WHERE user_id = $1 AND $2 = ANY(linked_athlete_ids)`,
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
        'SELECT * FROM personal_bests WHERE athlete_id = $1 ORDER BY distance ASC',
        [athleteId],
      ),
      pool.query(
        'SELECT * FROM diagnoses WHERE athlete_id = $1 ORDER BY diagnosed_at DESC LIMIT 5',
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
