import pool from '../pool';

export interface ParentProfileRow {
  id: string;
  user_id: string;
  created_at: Date;
}

export interface ParentAthleteLinkRow {
  id: string;
  parent_id: string;
  athlete_id: string;
  status: 'pending' | 'active' | 'revoked';
  link_code: string | null;
  linked_at: Date | null;
  created_at: Date;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function findParentProfileByUserId(
  userId: string,
): Promise<ParentProfileRow | null> {
  const { rows } = await pool.query<ParentProfileRow>(
    'SELECT * FROM parent_profiles WHERE user_id = $1 LIMIT 1',
    [userId],
  );
  return rows[0] ?? null;
}

export async function createParentProfile(
  userId: string,
): Promise<ParentProfileRow> {
  const { rows } = await pool.query<ParentProfileRow>(
    'INSERT INTO parent_profiles (user_id) VALUES ($1) RETURNING *',
    [userId],
  );
  return rows[0] as ParentProfileRow;
}

// ─── Links ───────────────────────────────────────────────────────────────────

export async function createParentAthleteLink(
  parentId: string,
  athleteId: string,
  linkCode: string,
): Promise<ParentAthleteLinkRow> {
  const { rows } = await pool.query<ParentAthleteLinkRow>(
    `INSERT INTO parent_athlete_links (parent_id, athlete_id, link_code)
     VALUES ($1, $2, $3) RETURNING *`,
    [parentId, athleteId, linkCode],
  );
  return rows[0] as ParentAthleteLinkRow;
}

export async function activateParentAthleteLink(
  linkCode: string,
): Promise<ParentAthleteLinkRow | null> {
  const { rows } = await pool.query<ParentAthleteLinkRow>(
    `UPDATE parent_athlete_links
     SET status = 'active', linked_at = NOW()
     WHERE link_code = $1 AND status = 'pending'
     RETURNING *`,
    [linkCode],
  );
  return rows[0] ?? null;
}

export async function revokeParentAthleteLink(
  parentId: string,
  athleteId: string,
): Promise<void> {
  await pool.query(
    `UPDATE parent_athlete_links
     SET status = 'revoked'
     WHERE parent_id = $1 AND athlete_id = $2`,
    [parentId, athleteId],
  );
}

export async function getLinkedAthletes(
  parentId: string,
): Promise<Array<{
  link_id: string;
  link_status: string;
  athlete_profile_id: string;
  user_id: string;
  email: string;
  age_group: string | null;
  primary_event: string | null;
  streak_count: number;
  last_session_date: Date | null;
  next_race_date: Date | null;
}>> {
  const { rows } = await pool.query(
    `SELECT
       pal.id              AS link_id,
       pal.status          AS link_status,
       ap.id               AS athlete_profile_id,
       u.id                AS user_id,
       u.email,
       ap.age_group,
       ap.primary_event,
       ap.streak_count,
       ap.last_session_date,
       ap.next_race_date
     FROM parent_athlete_links pal
     JOIN athlete_profiles ap ON ap.id = pal.athlete_id
     JOIN users u             ON u.id  = ap.user_id
     WHERE pal.parent_id = $1 AND pal.status = 'active'
     ORDER BY u.email`,
    [parentId],
  );
  return rows;
}

export async function isParentLinkedToAthlete(
  parentId: string,
  athleteId: string,
): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM parent_athlete_links
     WHERE parent_id = $1 AND athlete_id = $2 AND status = 'active'
     LIMIT 1`,
    [parentId, athleteId],
  );
  return rows.length > 0;
}
