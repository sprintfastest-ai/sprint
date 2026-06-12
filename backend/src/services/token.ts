import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { storeRefreshToken as dbStoreRefreshToken, findRefreshToken, deleteRefreshToken } from '@/db/queries/users';
import type { JwtPayload, SubscriptionPlan, UserRole } from '@/types';

const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES_IN  ?? '15m';
const REFRESH_EXPIRES_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// ─── Signing ─────────────────────────────────────────────────────────────────

export function generateJWT(params: {
  userId: string;
  email: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  isVerified: boolean;
  athleteId?: string;
}): string {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    userId: params.userId,
    email: params.email,
    role: params.role,
    subscriptionPlan: params.subscriptionPlan,
    isVerified: params.isVerified,
    ...(params.athleteId ? { athleteId: params.athleteId } : {}),
  };
  return jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: ACCESS_EXPIRES as string,
  });
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(64).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_MS);
  await dbStoreRefreshToken(userId, tokenHash, expiresAt);
  return token;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as JwtPayload;
}

// ─── Storage / revocation ─────────────────────────────────────────────────────

export async function validateStoredRefreshToken(
  token: string,
): Promise<string | null> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const row = await findRefreshToken(tokenHash);
  return row?.user_id ?? null;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await deleteRefreshToken(tokenHash);
}

// ─── Convenience aliases used by authController ───────────────────────────────

export async function issueTokens(
  userId: string,
  email: string,
  role: UserRole,
  subscriptionPlan: SubscriptionPlan = 'free',
  isVerified = false,
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = generateJWT({ userId, email, role, subscriptionPlan, isVerified });
  const refreshToken = await generateRefreshToken(userId);
  return { accessToken, refreshToken };
}

// generateRefreshToken already persists the token hash in the DB.
// This shim exists so authController can call storeRefreshToken without changes.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function storeRefreshToken(_userId: string, _token: string): Promise<void> {
  // no-op: storage is handled inside generateRefreshToken
}
