import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { sendError } from '@/utils/response';
import { ERROR_CODES } from '@/utils/constants';

export function validate(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg as string)
      .join('; ');
    sendError(res, message, ERROR_CODES.VALIDATION_ERROR, 422);
    return;
  }
  next();
}
