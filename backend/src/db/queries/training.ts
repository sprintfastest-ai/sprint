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
  const { rows } = await pool.query<PersonalBest>(
    `SELECT * FROM personal_bests WHERE athlete_id = $1 ORDER BY distance ASC`,
    [athleteId],
  );
  return rows;
}

export async function upsertPersonalBest(pb: PersonalBest): Promise<PersonalBest> {
  const { rows } = await pool.query<PersonalBest>(
    `INSERT INTO personal_bests (athlete_id, distance, time_seconds, recorded_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (athlete_id, distance)
     DO UPDATE SET
       time_seconds = EXCLUDED.time_seconds,
       recorded_at  = EXCLUDED.recorded_at
     WHERE personal_bests.time_seconds > EXCLUDED.time_seconds
     RETURNING *`,
    [pb.athleteId, pb.distance, pb.timeSeconds, pb.recordedAt],
  );
  return rows[0] as PersonalBest;
}
