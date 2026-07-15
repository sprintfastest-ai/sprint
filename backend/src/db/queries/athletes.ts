import pool from '../pool';

export interface AthleteProfileRow {
  id: string;
  user_id: string;
  age_group: string | null;
  primary_event: string | null;
  training_days_per_week: number | null;
  next_race_date: Date | null;
  weakness_type: 'acceleration' | 'top_speed' | 'speed_endurance' | null;
  weakness_diagnosed_at: Date | null;
  streak_count: number;
  longest_streak: number;
  last_session_date: Date | null;
  onboarding_completed: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PersonalBestRow {
  id: string;
  athlete_id: string;
  distance_metres: number;
  time_seconds: string; // DECIMAL comes back as string from pg
  is_current_pb: boolean;
  recorded_at: Date;
  session_id: string | null;
  created_at: Date;
}

export interface DiagnosisRow {
  id: string;
  athlete_id: string;
  weakness_type: 'acceleration' | 'top_speed' | 'speed_endurance';
  answers: Record<string, unknown>;
  drill_prescription: unknown[];
  previous_diagnosis_id: string | null;
  created_at: Date;
}

export interface AchievementRow {
  id: string;
  athlete_id: string;
  badge_type: string;
  metadata: Record<string, unknown>;
  unlocked_at: Date;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function findAthleteProfileByUserId(
  userId: string,
): Promise<AthleteProfileRow | null> {
  const { rows } = await pool.query<AthleteProfileRow>(
    'SELECT * FROM athlete_profiles WHERE user_id = $1 LIMIT 1',
    [userId],
  );
  return rows[0] ?? null;
}

export async function findAthleteProfileById(
  id: string,
): Promise<AthleteProfileRow | null> {
  const { rows } = await pool.query<AthleteProfileRow>(
    'SELECT * FROM athlete_profiles WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function createAthleteProfile(
  userId: string,
  ageGroup: string,
  primaryEvent: string,
  trainingDaysPerWeek: number,
): Promise<AthleteProfileRow> {
  const { rows } = await pool.query<AthleteProfileRow>(
    `INSERT INTO athlete_profiles
       (user_id, age_group, primary_event, training_days_per_week)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, ageGroup, primaryEvent, trainingDaysPerWeek],
  );
  return rows[0] as AthleteProfileRow;
}

export async function updateAthleteProfile(
  id: string,
  fields: Partial<Pick<
    AthleteProfileRow,
    'age_group' | 'primary_event' | 'training_days_per_week' |
    'next_race_date' | 'weakness_type' | 'weakness_diagnosed_at'
  >>,
): Promise<AthleteProfileRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      sets.push(`${key} = $${idx++}`);
      values.push(value);
    }
  }
  if (sets.length === 0) return findAthleteProfileById(id);

  values.push(id);
  const { rows } = await pool.query<AthleteProfileRow>(
    `UPDATE athlete_profiles SET ${sets.join(', ')}, updated_at = NOW()
     WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

export async function incrementStreak(athleteId: string, sessionDate: Date): Promise<void> {
  await pool.query(
    `UPDATE athlete_profiles
     SET
       streak_count     = streak_count + 1,
       longest_streak   = GREATEST(longest_streak, streak_count + 1),
       last_session_date = $2,
       updated_at       = NOW()
     WHERE id = $1`,
    [athleteId, sessionDate],
  );
}

export async function resetStreak(athleteId: string): Promise<void> {
  await pool.query(
    `UPDATE athlete_profiles
     SET streak_count = 0, updated_at = NOW()
     WHERE id = $1`,
    [athleteId],
  );
}

// ─── Personal Bests ──────────────────────────────────────────────────────────

export async function getCurrentPBs(athleteId: string): Promise<PersonalBestRow[]> {
  const { rows } = await pool.query<PersonalBestRow>(
    `SELECT * FROM personal_bests
     WHERE athlete_id = $1 AND is_current_pb = TRUE
     ORDER BY distance_metres ASC`,
    [athleteId],
  );
  return rows;
}

export async function getAllPBHistory(
  athleteId: string,
  distanceMetres?: number,
): Promise<PersonalBestRow[]> {
  const params: unknown[] = [athleteId];
  let sql = `SELECT * FROM personal_bests WHERE athlete_id = $1`;
  if (distanceMetres !== undefined) {
    sql += ` AND distance_metres = $2`;
    params.push(distanceMetres);
  }
  sql += ` ORDER BY distance_metres ASC, recorded_at DESC`;
  const { rows } = await pool.query<PersonalBestRow>(sql, params);
  return rows;
}

export async function upsertPersonalBest(
  athleteId: string,
  distanceMetres: number,
  timeSeconds: number,
  sessionId?: string,
): Promise<{ improved: boolean; row: PersonalBestRow }> {
  // Demote existing PB for this distance
  const { rowCount } = await pool.query(
    `UPDATE personal_bests
     SET is_current_pb = FALSE
     WHERE athlete_id = $1 AND distance_metres = $2
       AND is_current_pb = TRUE AND time_seconds > $3`,
    [athleteId, distanceMetres, timeSeconds],
  );
  const improved = (rowCount ?? 0) > 0;

  const { rows } = await pool.query<PersonalBestRow>(
    `INSERT INTO personal_bests
       (athlete_id, distance_metres, time_seconds, is_current_pb, session_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [athleteId, distanceMetres, timeSeconds, improved, sessionId ?? null],
  );
  return { improved, row: rows[0] as PersonalBestRow };
}

// ─── Diagnoses ───────────────────────────────────────────────────────────────

export async function createDiagnosis(
  athleteId: string,
  weaknessType: DiagnosisRow['weakness_type'],
  answers: Record<string, unknown>,
  drillPrescription: unknown[],
  previousDiagnosisId?: string,
): Promise<DiagnosisRow> {
  const { rows } = await pool.query<DiagnosisRow>(
    `INSERT INTO diagnoses
       (athlete_id, weakness_type, answers, drill_prescription, previous_diagnosis_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      athleteId,
      weaknessType,
      JSON.stringify(answers),
      JSON.stringify(drillPrescription),
      previousDiagnosisId ?? null,
    ],
  );
  return rows[0] as DiagnosisRow;
}

export async function getDiagnosisHistory(athleteId: string): Promise<DiagnosisRow[]> {
  const { rows } = await pool.query<DiagnosisRow>(
    'SELECT * FROM diagnoses WHERE athlete_id = $1 ORDER BY created_at DESC',
    [athleteId],
  );
  return rows;
}

export async function getLatestDiagnosis(athleteId: string): Promise<DiagnosisRow | null> {
  const { rows } = await pool.query<DiagnosisRow>(
    'SELECT * FROM diagnoses WHERE athlete_id = $1 ORDER BY created_at DESC LIMIT 1',
    [athleteId],
  );
  return rows[0] ?? null;
}

// ─── Achievements ────────────────────────────────────────────────────────────

export async function unlockAchievement(
  athleteId: string,
  badgeType: string,
  metadata?: Record<string, unknown>,
): Promise<AchievementRow | null> {
  const { rows } = await pool.query<AchievementRow>(
    `INSERT INTO achievements (athlete_id, badge_type, metadata)
     VALUES ($1, $2, $3)
     ON CONFLICT (athlete_id, badge_type) DO NOTHING
     RETURNING *`,
    [athleteId, badgeType, JSON.stringify(metadata ?? {})],
  );
  return rows[0] ?? null; // null = already unlocked
}

export async function getAchievements(athleteId: string): Promise<AchievementRow[]> {
  const { rows } = await pool.query<AchievementRow>(
    'SELECT * FROM achievements WHERE athlete_id = $1 ORDER BY unlocked_at DESC',
    [athleteId],
  );
  return rows;
}

// ─── Streak recording ───────────────────────────────────────────────────────

/**
 * Records a completed session's date against the athlete's streak.
 * - Same calendar day as last session: no-op (already counted today).
 * - Exactly one day after last session: increments the streak.
 * - Any other gap (or no prior session): streak resets to 1.
 */
export async function recordSessionCompletion(athleteId: string, sessionDate: Date): Promise<void> {
  const profile = await findAthleteProfileById(athleteId);
  if (!profile) return;

  const toDayKey = (d: Date) => d.toISOString().slice(0, 10);
  const sessionDay = toDayKey(sessionDate);
  const lastDay = profile.last_session_date ? toDayKey(new Date(profile.last_session_date)) : null;

  if (lastDay === sessionDay) return; // already logged today

  const oneDayMs = 24 * 60 * 60 * 1000;
  const isConsecutive = lastDay !== null
    && new Date(sessionDay).getTime() - new Date(lastDay).getTime() === oneDayMs;

  if (isConsecutive) {
    await incrementStreak(athleteId, sessionDate);
  } else {
    await pool.query(
      `UPDATE athlete_profiles
       SET streak_count = 1, longest_streak = GREATEST(longest_streak, 1),
           last_session_date = $2, updated_at = NOW()
       WHERE id = $1`,
      [athleteId, sessionDate],
    );
  }
}

// ─── Badge catalogue ─────────────────────────────────────────────────────────

export interface BadgeDefinition {
  type: string;
  label: string;
  description: string;
  icon: string;
  check: (stats: AthleteBadgeStats) => boolean;
}

export interface AthleteBadgeStats {
  sessionCount: number;
  streakCount: number;
  longestStreak: number;
  pbCount: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { type: 'first_session',     label: 'First Steps',     description: 'Complete your first training session',   icon: 'footsteps', check: (s) => s.sessionCount >= 1 },
  { type: 'streak_3',          label: 'On a Roll',        description: '3-day training streak',                  icon: 'flame',      check: (s) => s.streakCount >= 3 },
  { type: 'streak_7',          label: 'Week Warrior',     description: '7-day training streak',                  icon: 'flame',      check: (s) => s.streakCount >= 7 },
  { type: 'streak_14',         label: 'Unstoppable',      description: '14-day training streak',                 icon: 'flame',      check: (s) => s.streakCount >= 14 },
  { type: 'streak_30',         label: 'Iron Will',        description: '30-day training streak',                 icon: 'flame',      check: (s) => s.streakCount >= 30 },
  { type: 'sessions_10',       label: 'Committed',        description: 'Complete 10 training sessions',          icon: 'barbell',    check: (s) => s.sessionCount >= 10 },
  { type: 'sessions_25',       label: 'Dedicated',        description: 'Complete 25 training sessions',          icon: 'barbell',    check: (s) => s.sessionCount >= 25 },
  { type: 'sessions_50',       label: 'Veteran',          description: 'Complete 50 training sessions',          icon: 'barbell',    check: (s) => s.sessionCount >= 50 },
  { type: 'sessions_100',      label: 'Centurion',        description: 'Complete 100 training sessions',         icon: 'medal',      check: (s) => s.sessionCount >= 100 },
  { type: 'first_pb',          label: 'Personal Best',    description: 'Log your first personal best',           icon: 'trophy',     check: (s) => s.pbCount >= 1 },
  { type: 'pb_collector_3',    label: 'PB Collector',     description: 'Log personal bests across 3 distances',  icon: 'trophy',     check: (s) => s.pbCount >= 3 },
  { type: 'pb_collector_5',    label: 'Speed Demon',      description: 'Log personal bests across 5 distances',  icon: 'trophy',     check: (s) => s.pbCount >= 5 },
  { type: 'longest_streak_21', label: 'Consistency King', description: 'Reach a 21-day best streak',             icon: 'ribbon',     check: (s) => s.longestStreak >= 21 },
];

/**
 * Evaluates all badge definitions against the athlete's current stats and
 * unlocks any newly-earned ones. Returns only the badges unlocked by *this*
 * call (empty array if nothing new).
 */
export async function checkAndUnlockBadges(athleteId: string): Promise<AchievementRow[]> {
  const [profile, sessionCountRes, pbRes, alreadyUnlocked] = await Promise.all([
    findAthleteProfileById(athleteId),
    pool.query<{ count: number }>('SELECT COUNT(*)::int AS count FROM sessions WHERE athlete_id = $1', [athleteId]),
    pool.query<{ count: number }>(
      'SELECT COUNT(DISTINCT distance_metres)::int AS count FROM personal_bests WHERE athlete_id = $1',
      [athleteId],
    ),
    getAchievements(athleteId),
  ]);

  const stats: AthleteBadgeStats = {
    sessionCount: sessionCountRes.rows[0]?.count ?? 0,
    pbCount: pbRes.rows[0]?.count ?? 0,
    streakCount: profile?.streak_count ?? 0,
    longestStreak: profile?.longest_streak ?? 0,
  };
  const unlockedTypes = new Set(alreadyUnlocked.map((a: AchievementRow) => a.badge_type));

  const newlyUnlocked: AchievementRow[] = [];
  for (const badge of BADGE_DEFINITIONS) {
    if (unlockedTypes.has(badge.type) || !badge.check(stats)) continue;
    const row = await unlockAchievement(athleteId, badge.type);
    if (row) newlyUnlocked.push(row);
  }
  return newlyUnlocked;
}
