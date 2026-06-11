import pool from '../pool';

export interface TrainingPlanRow {
  id: string;
  athlete_id: string;
  week_start_date: Date;
  plan_data: unknown[];
  is_taper_week: boolean;
  is_coach_override: boolean;
  coach_id: string | null;
  ai_model_version: string | null;
  generated_at: Date | null;
  created_at: Date;
}

export async function getPlanByAthleteAndWeek(
  athleteId: string,
  weekStartDate: Date,
): Promise<TrainingPlanRow | null> {
  // Coach override takes precedence over AI plan
  const { rows } = await pool.query<TrainingPlanRow>(
    `SELECT * FROM training_plans
     WHERE athlete_id = $1 AND week_start_date = $2
     ORDER BY is_coach_override DESC, created_at DESC
     LIMIT 1`,
    [athleteId, weekStartDate],
  );
  return rows[0] ?? null;
}

export async function getPlanById(id: string): Promise<TrainingPlanRow | null> {
  const { rows } = await pool.query<TrainingPlanRow>(
    'SELECT * FROM training_plans WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function createPlan(
  athleteId: string,
  weekStartDate: Date,
  planData: unknown[],
  options: {
    isTaperWeek?: boolean;
    isCoachOverride?: boolean;
    coachId?: string;
    aiModelVersion?: string;
  } = {},
): Promise<TrainingPlanRow> {
  const { rows } = await pool.query<TrainingPlanRow>(
    `INSERT INTO training_plans
       (athlete_id, week_start_date, plan_data, is_taper_week,
        is_coach_override, coach_id, ai_model_version, generated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
     RETURNING *`,
    [
      athleteId,
      weekStartDate,
      JSON.stringify(planData),
      options.isTaperWeek ?? false,
      options.isCoachOverride ?? false,
      options.coachId ?? null,
      options.aiModelVersion ?? null,
    ],
  );
  return rows[0] as TrainingPlanRow;
}

export async function getPlanHistoryForAthlete(
  athleteId: string,
  limit = 12,
): Promise<TrainingPlanRow[]> {
  const { rows } = await pool.query<TrainingPlanRow>(
    `SELECT * FROM training_plans
     WHERE athlete_id = $1
     ORDER BY week_start_date DESC
     LIMIT $2`,
    [athleteId, limit],
  );
  return rows;
}

export async function getAllAthletesNeedingPlans(weekStartDate: Date): Promise<
  Array<{
    id: string;
    user_id: string;
    age_group: string | null;
    weakness_type: string | null;
    training_days_per_week: number | null;
  }>
> {
  // Athletes who do NOT already have a plan for the target week
  const { rows } = await pool.query(
    `SELECT ap.id, ap.user_id, ap.age_group, ap.weakness_type, ap.training_days_per_week
     FROM athlete_profiles ap
     WHERE NOT EXISTS (
       SELECT 1 FROM training_plans tp
       WHERE tp.athlete_id = ap.id AND tp.week_start_date = $1
     )`,
    [weekStartDate],
  );
  return rows;
}
