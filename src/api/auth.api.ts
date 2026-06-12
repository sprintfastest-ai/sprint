import client from './client';
import type { User } from '@/types';

// ─── Payload / response types ─────────────────────────────────────────────────

export interface RegisterPayload {
  email: string;
  password: string;
  role: User['role'];
  /** Optional profile fields collected during onboarding */
  ageGroup?: string;
  primaryEvent?: string;
  trainingDaysPerWeek?: number;
  clubName?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Typed API functions ──────────────────────────────────────────────────────

/**
 * Creates a new account. Returns tokens + the newly created user.
 * Caller is responsible for persisting tokens (auth store does this).
 */
export async function register(data: RegisterPayload): Promise<AuthResponse> {
  const { data: body } = await client.post<{ data: AuthResponse }>(
    '/auth/register',
    data,
  );
  return body.data;
}

/**
 * Authenticates with email + password. Returns tokens + user.
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data: body } = await client.post<{ data: AuthResponse }>(
    '/auth/login',
    { email, password },
  );
  return body.data;
}

/**
 * Exchanges a refresh token for a new access token.
 * Used by the Axios interceptor in client.ts — calling code rarely needs this
 * directly, but it is exported for testing and manual use.
 */
export async function refreshToken(
  token: string,
): Promise<{ accessToken: string }> {
  const { data: body } = await client.post<{ data: { accessToken: string } }>(
    '/auth/refresh',
    { refreshToken: token },
  );
  return body.data;
}

/**
 * Confirms an email address using the verification token from the email link.
 */
export async function verifyEmail(token: string): Promise<void> {
  await client.post('/auth/verify-email', { token });
}

/**
 * Sends a password-reset link to the given email address.
 * Always resolves (server returns 200 whether or not the email exists).
 */
export async function requestPasswordReset(email: string): Promise<void> {
  await client.post('/auth/request-reset', { email });
}

/**
 * Sets a new password using the reset token from the email link.
 */
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  await client.post('/auth/reset-password', { token, newPassword });
}

/**
 * Invalidates the current refresh token server-side and removes it from
 * the token store. AsyncStorage cleanup is handled by the auth store.
 */
export async function logout(): Promise<void> {
  await client.post('/auth/logout');
}

/**
 * Returns the currently authenticated user's profile (reads JWT server-side).
 * Used by `restoreSession` to validate a stored access token on cold start.
 */
export async function me(): Promise<User> {
  const { data: body } = await client.get<{ data: User }>('/auth/me');
  return body.data;
}
