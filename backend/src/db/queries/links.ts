import crypto from 'crypto';
import pool from '../pool';

export interface LinkInviteRow {
  id: string;
  code: string;
  athlete_id: string;
  relationship: 'parent' | 'coach';
  expires_at: Date;
  redeemed_at: Date | null;
  redeemed_by: string | null;
  created_at: Date;
}

const INVITE_TTL_HOURS = 48;

export async function createLinkInvite(
  athleteId: string,
  relationship: 'parent' | 'coach',
): Promise<LinkInviteRow> {
  // 6-char alphanumeric, uppercased — short enough to read out loud/type in
  const code = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  const { rows } = await pool.query<LinkInviteRow>(
    `INSERT INTO link_invites (code, athlete_id, relationship, expires_at)
     VALUES ($1, $2, $3, NOW() + INTERVAL '${INVITE_TTL_HOURS} hours')
     RETURNING *`,
    [code, athleteId, relationship],
  );
  return rows[0] as LinkInviteRow;
}

export async function findValidInvite(
  code: string,
  relationship: 'parent' | 'coach',
): Promise<LinkInviteRow | null> {
  const { rows } = await pool.query<LinkInviteRow>(
    `SELECT * FROM link_invites
     WHERE code = $1 AND relationship = $2
       AND redeemed_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [code, relationship],
  );
  return rows[0] ?? null;
}

export async function markInviteRedeemed(inviteId: string, redeemedByUserId: string): Promise<void> {
  await pool.query(
    `UPDATE link_invites SET redeemed_at = NOW(), redeemed_by = $2 WHERE id = $1`,
    [inviteId, redeemedByUserId],
  );
}
