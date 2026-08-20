import pool from '../pool';

export interface LeaderboardEntry {
  athleteId: string;
  /** First-name-only, derived server-side from email — the raw email never leaves this module. */
  displayName: string;
  consistencyRank: number;
  streakRank: number;
  pbImprovementRank: number;
  sessionsThisWeek: number;
  streakCount: number;
  pbImprovementCount: number;
  isSelf: boolean;
}

interface RawRow {
  athlete_id: string;
  email: string;
  streak_count: number;
  sessions_this_week: string; // COUNT(...) comes back as string from pg
  pb_improvements: string;
}

/**
 * Never expose a raw email to another athlete — many users are minors (the
 * whole reason the U12 parental-consent gate exists). Only the derived
 * first-name-style label is ever returned from this module.
 */
function toDisplayName(email: string): string {
  const local = email.split('@')[0] || 'Athlete';
  return local.charAt(0).toUpperCase() + local.slice(1);
}

function rankOf(sorted: RawRow[], athleteId: string): number {
  return sorted.findIndex((r) => r.athlete_id === athleteId) + 1;
}

/**
 * Recomputes this week's leaderboard for every athlete sharing `ageGroup`,
 * persists it into leaderboard_snapshots (upsert), and returns it ranked by
 * consistency (sessions completed this week — the primary sort, matching
 * the table's own idx_leaderboard_consistency index).
 *
 * Computed fresh on every read rather than via a scheduled job — simplest
 * correct approach at current scale. leaderboard_snapshots still gives a
 * natural place to move this to a cron job later without changing the
 * read shape or the ranks already computed here.
 *
 * @param ageGroup             - The age-group tier to rank within (athletes only ever compete within their own tier).
 * @param weekStartDate        - Monday of the week being ranked, YYYY-MM-DD.
 * @param requestingAthleteId  - Marks that athlete's own row with isSelf for the client to highlight.
 */
export async function getLeaderboard(
  ageGroup: string,
  weekStartDate: string,
  requestingAthleteId: string,
): Promise<LeaderboardEntry[]> {
  const { rows: raw } = await pool.query<RawRow>(
    `SELECT
       ap.id AS athlete_id,
       u.email,
       ap.streak_count,
       COUNT(DISTINCT s.id) FILTER (
         WHERE s.completed_at >= $2::date AND s.completed_at < $2::date + INTERVAL '7 days'
       ) AS sessions_this_week,
       COUNT(DISTINCT pb.id) FILTER (
         WHERE pb.is_current_pb = TRUE
           AND pb.recorded_at >= $2::date AND pb.recorded_at < $2::date + INTERVAL '7 days'
       ) AS pb_improvements
     FROM athlete_profiles ap
     JOIN users u ON u.id = ap.user_id
     LEFT JOIN sessions s ON s.athlete_id = ap.id
     LEFT JOIN personal_bests pb ON pb.athlete_id = ap.id
     WHERE ap.age_group = $1
     GROUP BY ap.id, u.email, ap.streak_count`,
    [ageGroup, weekStartDate],
  );

  if (raw.length === 0) return [];

  // Rank in JS — N is small (athletes in one age group), avoids a gnarly
  // window-function query for three independent orderings.
  const bySessions = [...raw].sort((a, b) => Number(b.sessions_this_week) - Number(a.sessions_this_week));
  const byStreak = [...raw].sort((a, b) => b.streak_count - a.streak_count);
  const byImprovement = [...raw].sort((a, b) => Number(b.pb_improvements) - Number(a.pb_improvements));

  // Persist the snapshot — keeps leaderboard_snapshots as the historical
  // record even though reads are computed fresh right now.
  await Promise.all(
    raw.map((r) =>
      pool.query(
        `INSERT INTO leaderboard_snapshots
           (athlete_id, age_group, week_start_date, consistency_rank, streak_rank, pb_improvement_rank, sessions_this_week)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (athlete_id, week_start_date)
         DO UPDATE SET consistency_rank = $4, streak_rank = $5, pb_improvement_rank = $6, sessions_this_week = $7`,
        [
          r.athlete_id,
          ageGroup,
          weekStartDate,
          rankOf(bySessions, r.athlete_id),
          rankOf(byStreak, r.athlete_id),
          rankOf(byImprovement, r.athlete_id),
          Number(r.sessions_this_week),
        ],
      ),
    ),
  );

  return bySessions.map((r) => ({
    athleteId: r.athlete_id,
    displayName: toDisplayName(r.email),
    consistencyRank: rankOf(bySessions, r.athlete_id),
    streakRank: rankOf(byStreak, r.athlete_id),
    pbImprovementRank: rankOf(byImprovement, r.athlete_id),
    sessionsThisWeek: Number(r.sessions_this_week),
    streakCount: r.streak_count,
    pbImprovementCount: Number(r.pb_improvements),
    isSelf: r.athlete_id === requestingAthleteId,
  }));
}
