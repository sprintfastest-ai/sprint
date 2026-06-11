import pool from '../pool';
import type { PoolClient } from 'pg';

export interface CoachProfileRow {
  id: string;
  user_id: string;
  club_name: string | null;
  bio: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CoachAthleteLinkRow {
  id: string;
  coach_id: string;
  athlete_id: string;
  status: 'pending' | 'active' | 'removed';
  invite_code: string | null;
  linked_at: Date | null;
  created_at: Date;
}

export interface CoachNoteRow {
  id: string;
  coach_id: string;
  athlete_id: string;
  content: string;
  is_visible_to_athlete: boolean;
  created_at: Date;
  updated_at: Date;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function findCoachProfileByUserId(
  userId: string,
): Promise<CoachProfileRow | null> {
  const { rows } = await pool.query<CoachProfileRow>(
    'SELECT * FROM coach_profiles WHERE user_id = $1 LIMIT 1',
    [userId],
  );
  return rows[0] ?? null;
}

export async function findCoachProfileById(id: string): Promise<CoachProfileRow | null> {
  const { rows } = await pool.query<CoachProfileRow>(
    'SELECT * FROM coach_profiles WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function createCoachProfile(
  userId: string,
  clubName?: string,
  bio?: string,
): Promise<CoachProfileRow> {
  const { rows } = await pool.query<CoachProfileRow>(
    `INSERT INTO coach_profiles (user_id, club_name, bio)
     VALUES ($1, $2, $3) RETURNING *`,
    [userId, clubName ?? null, bio ?? null],
  );
  return rows[0] as CoachProfileRow;
}

export async function updateCoachProfile(
  id: string,
  fields: Partial<Pick<CoachProfileRow, 'club_name' | 'bio'>>,
): Promise<CoachProfileRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(fields)) {
    sets.push(`${key} = $${idx++}`);
    values.push(value);
  }
  if (sets.length === 0) return findCoachProfileById(id);
  values.push(id);
  const { rows } = await pool.query<CoachProfileRow>(
    `UPDATE coach_profiles SET ${sets.join(', ')}, updated_at = NOW()
     WHERE id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}

// ─── Links ───────────────────────────────────────────────────────────────────

export async function createCoachAthleteLink(
  coachId: string,
  athleteId: string,
  inviteCode: string,
): Promise<CoachAthleteLinkRow> {
  const { rows } = await pool.query<CoachAthleteLinkRow>(
    `INSERT INTO coach_athlete_links (coach_id, athlete_id, invite_code)
     VALUES ($1, $2, $3) RETURNING *`,
    [coachId, athleteId, inviteCode],
  );
  return rows[0] as CoachAthleteLinkRow;
}

export async function activateCoachAthleteLink(
  inviteCode: string,
): Promise<CoachAthleteLinkRow | null> {
  const { rows } = await pool.query<CoachAthleteLinkRow>(
    `UPDATE coach_athlete_links
     SET status = 'active', linked_at = NOW()
     WHERE invite_code = $1 AND status = 'pending'
     RETURNING *`,
    [inviteCode],
  );
  return rows[0] ?? null;
}

export async function getLinkedAthletes(
  coachId: string,
  client?: PoolClient,
): Promise<Array<{
  link_id: string;
  link_status: string;
  athlete_profile_id: string;
  user_id: string;
  email: string;
  age_group: string | null;
  primary_event: string | null;
  weakness_type: string | null;
  streak_count: number;
}>> {
  const q = client ?? pool;
  const { rows } = await q.query(
    `SELECT
       cal.id          AS link_id,
       cal.status      AS link_status,
       ap.id           AS athlete_profile_id,
       u.id            AS user_id,
       u.email,
       ap.age_group,
       ap.primary_event,
       ap.weakness_type,
       ap.streak_count
     FROM coach_athlete_links cal
     JOIN athlete_profiles ap ON ap.id  = cal.athlete_id
     JOIN users u             ON u.id   = ap.user_id
     WHERE cal.coach_id = $1 AND cal.status = 'active'
     ORDER BY u.email`,
    [coachId],
  );
  return rows;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export async function createCoachNote(
  coachId: string,
  athleteId: string,
  content: string,
  isVisibleToAthlete: boolean,
): Promise<CoachNoteRow> {
  const { rows } = await pool.query<CoachNoteRow>(
    `INSERT INTO coach_notes (coach_id, athlete_id, content, is_visible_to_athlete)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [coachId, athleteId, content, isVisibleToAthlete],
  );
  return rows[0] as CoachNoteRow;
}

export async function getNotesByCoachAndAthlete(
  coachId: string,
  athleteId: string,
): Promise<CoachNoteRow[]> {
  const { rows } = await pool.query<CoachNoteRow>(
    `SELECT * FROM coach_notes
     WHERE coach_id = $1 AND athlete_id = $2
     ORDER BY created_at DESC`,
    [coachId, athleteId],
  );
  return rows;
}

export async function getNotesVisibleToAthlete(
  athleteId: string,
): Promise<CoachNoteRow[]> {
  const { rows } = await pool.query<CoachNoteRow>(
    `SELECT cn.*, u.email AS coach_email
     FROM coach_notes cn
     JOIN coach_profiles cp ON cp.id = cn.coach_id
     JOIN users u           ON u.id  = cp.user_id
     WHERE cn.athlete_id = $1 AND cn.is_visible_to_athlete = TRUE
     ORDER BY cn.created_at DESC`,
    [athleteId],
  );
  return rows;
}

export async function updateCoachNote(
  id: string,
  coachId: string,
  fields: Partial<Pick<CoachNoteRow, 'content' | 'is_visible_to_athlete'>>,
): Promise<CoachNoteRow | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  for (const [key, value] of Object.entries(fields)) {
    sets.push(`${key} = $${idx++}`);
    values.push(value);
  }
  if (sets.length === 0) return null;
  values.push(id, coachId);
  const { rows } = await pool.query<CoachNoteRow>(
    `UPDATE coach_notes SET ${sets.join(', ')}, updated_at = NOW()
     WHERE id = $${idx++} AND coach_id = $${idx} RETURNING *`,
    values,
  );
  return rows[0] ?? null;
}
