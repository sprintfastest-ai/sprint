import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import pool from '@/db/pool';
import { getLinkedAthletes as getLinkedAthletesQuery } from '@/db/queries/parents';

export async function getLinkedAthletes(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { rows: parentRows } = await pool.query<{ id: string }>(
      'SELECT id FROM parent_profiles WHERE user_id = $1 LIMIT 1',
      [userId],
    );
    const parentId = parentRows[0]?.id;
    if (!parentId) {
      sendSuccess(res, []);
      return;
    }

    const rows = await getLinkedAthletesQuery(parentId);
    const athletes = rows.map((r) => ({
      athleteId: r.athlete_profile_id,
      userId: r.user_id,
      email: r.email,
      ageGroup: r.age_group,
      primaryEvent: r.primary_event,
      streakCount: r.streak_count,
      lastSessionDate: r.last_session_date,
      nextRaceDate: r.next_race_date,
    }));
    sendSuccess(res, athletes);
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
    const parentUserId = req.user?.userId;
    const { athleteId } = req.params as { athleteId: string };

    // Verify the parent is linked to this athlete
    const { rows: link } = await pool.query(
      `SELECT 1 FROM parent_profiles pp
       JOIN parent_athlete_links pal ON pal.parent_id = pp.id
       WHERE pp.user_id = $1 AND pal.athlete_id = $2 AND pal.status = 'active'`,
      [parentUserId, athleteId],
    );
    if (!link.length) {
      throw new AppError('Forbidden', ERROR_CODES.FORBIDDEN, 403);
    }

    const [sessions, pbs, diagnoses] = await Promise.all([
      pool.query(
        `SELECT id, athlete_id AS "athleteId", plan_id AS "planId",
                day_number AS "dayNumber", completed_at AS "completedAt",
                drills_completed AS "timesRecorded"
         FROM sessions WHERE athlete_id = $1 ORDER BY completed_at DESC LIMIT 20`,
        [athleteId],
      ),
      pool.query(
        `SELECT athlete_id AS "athleteId", distance_metres AS distance, time_seconds AS "timeSeconds", recorded_at AS "recordedAt"
         FROM personal_bests WHERE athlete_id = $1 AND is_current_pb = TRUE ORDER BY distance_metres ASC`,
        [athleteId],
      ),
      pool.query(
        `SELECT id, athlete_id AS "athleteId", weakness_type AS "weaknessType",
                drill_prescription AS "drillPrescription", created_at AS "diagnosedAt"
         FROM diagnoses WHERE athlete_id = $1 ORDER BY created_at DESC LIMIT 5`,
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
