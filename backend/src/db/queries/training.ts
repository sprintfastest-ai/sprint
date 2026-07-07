import pool from '../pool';
import type { TrainingPlan, Session, PersonalBest } from '@/types';

export async function getPlanByAthleteAndWeek(
  athleteId: string,
  weekStartDate: string,
): Promise<TrainingPlan | null> {
  const { rows } = await pool.query<TrainingPlan>(
    `SELECT * FROM training_plans
     WHERE athlete_id = $1 AND week_start_date = $2
     ORDER BY created_at DESC
     LIMIT 1`,
    [athleteId, weekStartDate],
  );
  return rows[0] ?? null;
}

export async function insertPlan(plan: Omit<TrainingPlan, 'id' | 'createdAt'>): Promise<TrainingPlan> {
  const { rows } = await pool.query<TrainingPlan>(
    `INSERT INTO training_plans
       (athlete_id, week_start_date, days, is_coach_override, coach_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [plan.athleteId, plan.weekStartDate, JSON.stringify(plan.days), plan.isCoachOverride, plan.coachId ?? null],
  );
  return rows[0] as TrainingPlan;
}

export async function getSessionsByAthlete(athleteId: string): Promise<Session[]> {
  const { rows } = await pool.query<Session>(
    'SELECT * FROM sessions WHERE athlete_id = $1 ORDER BY completed_at DESC',
    [athleteId],
  );
  return rows;
}

export async function insertSession(
  athleteId: string,
  planId: string,
  timesRecorded: PersonalBest[],
): Promise<Session> {
  const { rows } = await pool.query<Session>(
    `INSERT INTO sessions (athlete_id, plan_id, times_recorded)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [athleteId, planId, JSON.stringify(timesRecorded)],
  );
  return rows[0] as Session;
}

export async function getPersonalBestsByAthlete(athleteId: string): Promise<PersonalBest[]> {
  const { rows } = await pool.query(
    `SELECT
       athlete_id   AS "athleteId",
       distance_metres AS distance,
       time_seconds AS "timeSeconds",
       recorded_at  AS "recordedAt"
     FROM personal_bests
     WHERE athlete_id = $1 AND is_current_pb = TRUE
     ORDER BY distance_metres ASC`,
    [athleteId],
  );
  return rows as PersonalBest[];
}

export async function upsertPersonalBest(pb: PersonalBest): Promise<PersonalBest> {
  // Mark old PB as not current, then insert new one if it's faster
  await pool.query(
    `UPDATE personal_bests
     SET is_current_pb = FALSE
     WHERE athlete_id = $1 AND distance_metres = $2 AND time_seconds > $3`,
    [pb.athleteId, pb.distance, pb.timeSeconds],
  );

  const { rows } = await pool.query(
    `INSERT INTO personal_bests (athlete_id, distance_metres, time_seconds, is_current_pb, recorded_at)
     VALUES ($1, $2, $3, TRUE, NOW())
     ON CONFLICT DO NOTHING
     RETURNING
       athlete_id   AS "athleteId",
       distance_metres AS distance,
       time_seconds AS "timeSeconds",
       recorded_at  AS "recordedAt"`,
    [pb.athleteId, pb.distance, pb.timeSeconds],
  );
  return (rows[0] ?? pb) as PersonalBest;
}
