import pool from '../pool';

export interface SessionRow {
  id: string;
  athlete_id: string;
  plan_id: string | null;
  day_number: number | null;
  completed_at: Date;
  drills_completed: unknown[];
  notes: string | null;
  created_at: Date;
}

export interface WeeklyGoalRow {
  id: string;
  athlete_id: string;
  week_start_date: Date;
  target_sessions: number;
  completed_sessions: number;
  created_at: Date;
}

// ─── Sessions ────────────────────────────────────────────────────────────────

export async function createSession(
  athleteId: string,
  planId: string | null,
  dayNumber: number | null,
  drillsCompleted: unknown[],
  notes?: string,
): Promise<SessionRow> {
  const { rows } = await pool.query<SessionRow>(
    `INSERT INTO sessions
       (athlete_id, plan_id, day_number, drills_completed, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [athleteId, planId, dayNumber, JSON.stringify(drillsCompleted), notes ?? null],
  );
  return rows[0] as SessionRow;
}

export async function getSessionsByAthlete(
  athleteId: string,
  limit = 50,
  offset = 0,
): Promise<SessionRow[]> {
  const { rows } = await pool.query<SessionRow>(
    `SELECT * FROM sessions
     WHERE athlete_id = $1
     ORDER BY completed_at DESC
     LIMIT $2 OFFSET $3`,
    [athleteId, limit, offset],
  );
  return rows;
}

export async function getSessionById(id: string): Promise<SessionRow | null> {
  const { rows } = await pool.query<SessionRow>(
    'SELECT * FROM sessions WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function countSessionsInWeek(
  athleteId: string,
  weekStartDate: Date,
): Promise<number> {
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::TEXT AS count FROM sessions
     WHERE athlete_id = $1
       AND completed_at >= $2
       AND completed_at <  $3`,
    [athleteId, weekStartDate, weekEnd],
  );
  return parseInt(rows[0]?.count ?? '0', 10);
}

export async function getRecentSessionDates(
  athleteId: string,
  days = 14,
): Promise<Date[]> {
  const { rows } = await pool.query<{ completed_at: Date }>(
    `SELECT completed_at FROM sessions
     WHERE athlete_id = $1
       AND completed_at >= NOW() - ($2 || ' days')::INTERVAL
     ORDER BY completed_at DESC`,
    [athleteId, days],
  );
  return rows.map((r) => r.completed_at);
}

// ─── Weekly Goals ─────────────────────────────────────────────────────────────

export async function upsertWeeklyGoal(
  athleteId: string,
  weekStartDate: Date,
  targetSessions: number,
): Promise<WeeklyGoalRow> {
  const { rows } = await pool.query<WeeklyGoalRow>(
    `INSERT INTO weekly_goals (athlete_id, week_start_date, target_sessions)
     VALUES ($1, $2, $3)
     ON CONFLICT (athlete_id, week_start_date)
     DO UPDATE SET target_sessions = EXCLUDED.target_sessions
     RETURNING *`,
    [athleteId, weekStartDate, targetSessions],
  );
  return rows[0] as WeeklyGoalRow;
}

export async function incrementWeeklyGoalProgress(
  athleteId: string,
  weekStartDate: Date,
): Promise<WeeklyGoalRow | null> {
  const { rows } = await pool.query<WeeklyGoalRow>(
    `UPDATE weekly_goals
     SET completed_sessions = completed_sessions + 1
     WHERE athlete_id = $1 AND week_start_date = $2
     RETURNING *`,
    [athleteId, weekStartDate],
  );
  return rows[0] ?? null;
}

export async function getWeeklyGoal(
  athleteId: string,
  weekStartDate: Date,
): Promise<WeeklyGoalRow | null> {
  const { rows } = await pool.query<WeeklyGoalRow>(
    `SELECT * FROM weekly_goals
     WHERE athlete_id = $1 AND week_start_date = $2
     LIMIT 1`,
    [athleteId, weekStartDate],
  );
  return rows[0] ?? null;
}
