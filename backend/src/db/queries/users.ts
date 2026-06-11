import pool from '../pool';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: 'athlete' | 'parent' | 'coach' | 'admin';
  is_verified: boolean;
  verification_token: string | null;
  reset_token: string | null;
  reset_token_expires: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type SafeUser = Omit<UserRow, 'password_hash' | 'reset_token' | 'verification_token'>;

export async function findUserById(id: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    'SELECT * FROM users WHERE id = $1 LIMIT 1',
    [id],
  );
  return rows[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email.toLowerCase()],
  );
  return rows[0] ?? null;
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: UserRow['role'],
  verificationToken?: string,
): Promise<UserRow> {
  const { rows } = await pool.query<UserRow>(
    `INSERT INTO users (email, password_hash, role, verification_token)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [email.toLowerCase(), passwordHash, role, verificationToken ?? null],
  );
  return rows[0] as UserRow;
}

export async function verifyUserEmail(token: string): Promise<UserRow | null> {
  const { rows } = await pool.query<UserRow>(
    `UPDATE users
     SET is_verified = TRUE, verification_token = NULL, updated_at = NOW()
     WHERE verification_token = $1
     RETURNING *`,
    [token],
  );
  return rows[0] ?? null;
}

export async function setResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}

export async function findValidResetToken(
  tokenHash: string,
): Promise<{ user_id: string; id: string } | null> {
  const { rows } = await pool.query<{ user_id: string; id: string }>(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = $1
       AND expires_at > NOW()
       AND used = FALSE
     LIMIT 1`,
    [tokenHash],
  );
  return rows[0] ?? null;
}

export async function consumeResetToken(tokenId: string, newPasswordHash: string, userId: string): Promise<void> {
  await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [tokenId]);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newPasswordHash, userId],
  );
}

export async function storeRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
): Promise<void> {
  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt],
  );
}

export async function findRefreshToken(
  tokenHash: string,
): Promise<{ user_id: string } | null> {
  const { rows } = await pool.query<{ user_id: string }>(
    `SELECT user_id FROM refresh_tokens
     WHERE token_hash = $1 AND expires_at > NOW()
     LIMIT 1`,
    [tokenHash],
  );
  return rows[0] ?? null;
}

export async function deleteRefreshToken(tokenHash: string): Promise<void> {
  await pool.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
}

export async function deleteAllRefreshTokensForUser(userId: string): Promise<void> {
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

export async function purgeExpiredTokens(): Promise<void> {
  await pool.query('DELETE FROM refresh_tokens WHERE expires_at <= NOW()');
  await pool.query('DELETE FROM password_reset_tokens WHERE expires_at <= NOW()');
}
