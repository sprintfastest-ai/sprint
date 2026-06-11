import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import { findUserByEmail, createUser } from '@/db/queries/users';
import {
  issueTokens,
  storeRefreshToken,
  revokeRefreshToken,
  validateStoredRefreshToken,
  verifyRefreshToken,
} from '@/services/token';
import { sendWelcome, sendPasswordReset } from '@/services/email';
import pool from '@/db/pool';
import type { UserRole } from '@/types';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password, role } = req.body as {
      email: string;
      password: string;
      role: UserRole;
    };

    const existing = await findUserByEmail(email);
    if (existing) {
      throw new AppError('Email already in use', ERROR_CODES.CONFLICT, 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser(email, passwordHash, role);
    const tokens = issueTokens(user.id, user.email, user.role);
    await storeRefreshToken(user.id, tokens.refreshToken);

    // Fire-and-forget welcome email
    sendWelcome(email, role).catch(() => null);

    const { passwordHash: _ph, ...safeUser } = user;
    sendSuccess(res, { user: safeUser, ...tokens }, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };

    const user = await findUserByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password', ERROR_CODES.INVALID_CREDENTIALS, 401);
    }

    const tokens = issueTokens(user.id, user.email, user.role);
    await storeRefreshToken(user.id, tokens.refreshToken);

    const { passwordHash: _ph, ...safeUser } = user;
    sendSuccess(res, { user: safeUser, ...tokens });
  } catch (err) {
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken: string };

    const isValid = await validateStoredRefreshToken(refreshToken);
    if (!isValid) {
      throw new AppError('Invalid or expired refresh token', ERROR_CODES.TOKEN_INVALID, 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    await revokeRefreshToken(refreshToken);

    const tokens = issueTokens(payload.sub, payload.email, payload.role);
    await storeRefreshToken(payload.sub, tokens.refreshToken);

    sendSuccess(res, tokens);
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [req.user?.sub],
    );
    if (!rows[0]) {
      throw new AppError('User not found', ERROR_CODES.NOT_FOUND, 404);
    }
    sendSuccess(res, rows[0]);
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email } = req.body as { email: string };
    const user = await findUserByEmail(email);

    // Always return 200 to prevent user enumeration
    if (!user) {
      sendSuccess(res, null);
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt],
    );

    sendPasswordReset(email, token).catch(() => null);
    sendSuccess(res, null);
  } catch (err) {
    next(err);
  }
}
