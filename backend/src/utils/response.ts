import type { Response } from 'express';
import type { ApiMeta, ApiSuccessResponse, ApiErrorResponse } from '@/types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: ApiMeta,
): void {
  const body: ApiSuccessResponse<T> = {
    success: true,
    data,
    error: null,
    ...(meta ? { meta } : {}),
  };
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  error: string,
  code: string,
  statusCode = 400,
): void {
  const body: ApiErrorResponse = {
    success: false,
    data: null,
    error,
    code,
  };
  res.status(statusCode).json(body);
}
