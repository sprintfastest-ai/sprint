import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import { findUserById } from '@/db/queries/users';
import pool from '@/db/pool';
import {
  register,
  login,
  refreshToken,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  logout,
} from '@/services/auth.service';
import type { UserRole, RegisterProfileData } from '@/types';

// ─── POST /api/v1/auth/register ───────────────────────────────────────────────

export async function registerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      email,
      password,
      role,
      profileData,
    } = req.body as {
      email: string;
      password: string;
      role: UserRole;
      profileData?: RegisterProfileData;
    };

    const result = await register(email, password, role, profileData ?? {});
    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/auth/login ──────────────────────────────────────────────────

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await login(email, password);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/auth/refresh ────────────────────────────────────────────────

export async function refreshHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken: token } = req.body as { refreshToken: string };
    const result = await refreshToken(token);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/auth/verify-email ──────────────────────────────────────────

export async function verifyEmailHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = req.body as { token: string };
    await verifyEmail(token);
    sendSuccess(res, { message: 'Email verified successfully.' });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/auth/request-reset ─────────────────────────────────────────

export async function requestResetHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = req.body as { email: string };
    await requestPasswordReset(email);
    // Always return 200 — don't reveal whether the email is registered
    sendSuccess(res, { message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/auth/reset-password ────────────────────────────────────────

export async function resetPasswordHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token, newPassword } = req.body as {
      token: string;
      newPassword: string;
    };
    await resetPassword(token, newPassword);
    sendSuccess(res, { message: 'Password updated. Please sign in again.' });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/v1/auth/logout ───────────────────────────────────────────────

export async function logoutHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken: token } = req.body as { refreshToken: string };
    const userId = req.user?.userId ?? 'anonymous';
    await logout(token, userId);
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/auth/me ──────────────────────────────────────────────────────

export async function meHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Not authenticated.', ERROR_CODES.UNAUTHORIZED, 401);
    }

    const user = await findUserById(userId);
    if (!user) {
      throw new AppError('User not found.', ERROR_CODES.NOT_FOUND, 404);
    }

    // Strip sensitive fields
    const { password_hash: _ph, verification_token: _vt, reset_token: _rt, ...safeUser } = user;

    // Attach athleteId + onboarding status for athlete users so the mobile
    // app can decide whether to route into the onboarding flow.
    let athleteId: string | undefined;
    let onboardingCompleted: boolean | undefined;
    if (safeUser.role === 'athlete') {
      const { rows } = await pool.query<{ id: string; onboarding_completed: boolean }>(
        'SELECT id, onboarding_completed FROM athlete_profiles WHERE user_id = $1 LIMIT 1',
        [userId],
      );
      athleteId = rows[0]?.id;
      onboardingCompleted = rows[0]?.onboarding_completed;
    }

    sendSuccess(res, { ...safeUser, athleteId, onboardingCompleted });
  } catch (err) {
    next(err);
  }
}
