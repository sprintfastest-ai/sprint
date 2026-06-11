import type { Request, Response, NextFunction } from 'express';
import { sendError } from '@/utils/response';
import { ERROR_CODES } from '@/utils/constants';
import type { UserRole } from '@/types';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Not authenticated', ERROR_CODES.UNAUTHORIZED, 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(
        res,
        'You do not have permission to perform this action',
        ERROR_CODES.FORBIDDEN,
        403,
      );
      return;
    }
    next();
  };
}
