import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '@/utils/response';
import { ERROR_CODES } from '@/utils/constants';
import type { JwtPayload } from '@/types';

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
