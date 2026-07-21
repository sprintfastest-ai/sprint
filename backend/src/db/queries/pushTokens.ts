import pool from '../pool';

export interface PushTokenRow {
  id: string;
  user_id: string;
  token: string;
  platform: 'ios' | 'android';
  created_at: Date;
  last_seen_at: Date;
}

export async function upsertPushToken(
  userId: string,
  token: string,
  platform: 'ios' | 'android',
): Promise<PushTokenRow> {
  const { rows } = await pool.query<PushTokenRow>(
    `INSERT INTO push_tokens (user_id, token, platform)
     VALUES ($1, $2, $3)
     ON CONFLICT (token) DO UPDATE
       SET user_id = EXCLUDED.user_id, platform = EXCLUDED.platform, last_seen_at = NOW()
     RETURNING *`,
    [userId, token, platform],
  );
  return rows[0] as PushTokenRow;
}

export async function deletePushToken(token: string): Promise<void> {
  await pool.query('DELETE FROM push_tokens WHERE token = $1', [token]);
}

export async function deletePushTokens(tokens: string[]): Promise<void> {
  if (!tokens.length) return;
  await pool.query('DELETE FROM push_tokens WHERE token = ANY($1)', [tokens]);
}

export async function getTokensForUser(userId: string): Promise<string[]> {
  const { rows } = await pool.query<{ token: string }>(
    'SELECT token FROM push_tokens WHERE user_id = $1',
    [userId],
  );
  return rows.map((r) => r.token);
}

export async function getTokensForUsers(userIds: string[]): Promise<string[]> {
  if (!userIds.length) return [];
  const { rows } = await pool.query<{ token: string }>(
    'SELECT token FROM push_tokens WHERE user_id = ANY($1)',
    [userIds],
  );
  return rows.map((r) => r.token);
}
