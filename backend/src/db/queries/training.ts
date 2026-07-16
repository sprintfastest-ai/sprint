import pool from '../pool';
import type { TrainingPlan, Session, PersonalBest } from '@/types';

const PLAN_COLUMNS = `
  id,
  athlete_id       AS "athleteId",
  week_start_date  AS "weekStartDate",
  plan_data        AS "days",
  is_coach_override AS "isCoachOverride",
  is_taper_week    AS "isTaperWeek",
  coach_id         AS "coachId",
  created_at       AS "createdAt"
`;

export async function getPlanByAthleteAndWeek(
  athleteId: string,
  weekStartDate: string,
): Promise<TrainingPlan | null> {
  const { rows } = await pool.query<TrainingPlan>(
    `SELECT ${PLAN_COLUMNS} FROM training_plans
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
       (athlete_id, week_start_date, plan_data, is_coach_override, is_taper_week, coach_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${PLAN_COLUMNS}`,
    [
      plan.athleteId,
      plan.weekStartDate,
      JSON.stringify(plan.days),
      plan.isCoachOverride,
      plan.isTaperWeek ?? false,
      plan.coachId ?? null,
    ],
  );
  return rows[0] as TrainingPlan;
}

const SESSION_COLUMNS = `
  id,
  athlete_id       AS "athleteId",
  plan_id          AS "planId",
  day_number       AS "dayNumber",
  completed_at     AS "completedAt",
  drills_completed AS "timesRecorded"
`;

export async function getSessionsByAthlete(athleteId: string): Promise<Session[]> {
  const { rows } = await pool.query<Session>(
    `SELECT ${SESSION_COLUMNS} FROM sessions WHERE athlete_id = $1 ORDER BY completed_at DESC`,
    [athleteId],
  );
  return rows;
}

export async function insertSession(
  athleteId: string,
  planId: string,
  timesRecorded: PersonalBest[],
  dayNumber?: number,
): Promise<Session> {
  // `drills_completed` is the actual JSONB column on `sessions` — reused here
  // to store the times recorded for this session (no dedicated column exists).
  const { rows } = await pool.query<Session>(
    `INSERT INTO sessions (athlete_id, plan_id, day_number, drills_completed)
     VALUES ($1, $2, $3, $4)
     RETURNING ${SESSION_COLUMNS}`,
    [athleteId, planId, dayNumber ?? null, JSON.stringify(timesRecorded)],
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
