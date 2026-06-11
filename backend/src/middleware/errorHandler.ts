import type { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';
import { sendError } from '@/utils/response';
import { ERROR_CODES } from '@/utils/constants';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    logger.warn('Application error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
    });
    sendError(res, err.message, err.code, err.statusCode);
    return;
  }

  const error = err as Error;
  logger.error('Unhandled error', {
    message: error.message,
    stack: isProduction ? undefined : error.stack,
  });

  sendError(
    res,
    isProduction ? 'An unexpected error occurred' : error.message,
    ERROR_CODES.INTERNAL_ERROR,
    500,
  );
}
