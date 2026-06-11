import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '@/utils/response';
import { ERROR_CODES } from '@/utils/constants';
import type { JwtPayload, UserRole } from '@/types';
import logger from '@/utils/logger';

// ─── Token verification ───────────────────────────────────────────────────────

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    sendError(res, 'Missing or malformed token', ERROR_CODES.UNAUTHORIZED, 401);
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      sendError(res, 'Token has expired', ERROR_CODES.TOKEN_EXPIRED, 401);
    } else {
      sendError(res, 'Invalid token', ERROR_CODES.TOKEN_INVALID, 401);
    }
  }
}

// Alias used by route files that import this name
export const authenticateToken = authenticate;

// ─── Role guard ───────────────────────────────────────────────────────────────

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Not authenticated', ERROR_CODES.UNAUTHORIZED, 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      logger.warn('Forbidden role access attempt', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      sendError(
        res,
        `Access restricted to: ${roles.join(', ')}`,
        ERROR_CODES.FORBIDDEN,
        403,
      );
      return;
    }
    next();
  };
}

// ─── Email verification guard ─────────────────────────────────────────────────

export function requireVerified(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // isVerified is embedded in the JWT payload at login time.
  // For the rare case where it changes, the client must re-authenticate.
  const payload = req.user as (JwtPayload & { isVerified?: boolean }) | undefined;

  if (payload?.isVerified === false) {
    sendError(
      res,
      'Email address not yet verified. Please check your inbox.',
      ERROR_CODES.FORBIDDEN,
      403,
    );
    return;
  }
  next();
}
