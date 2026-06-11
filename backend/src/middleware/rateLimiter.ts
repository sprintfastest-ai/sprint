import rateLimit from 'express-rate-limit';
import { sendError } from '@/utils/response';
import { ERROR_CODES } from '@/utils/constants';
import type { Request, Response } from 'express';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;

export const globalLimiter = rateLimit({
  windowMs,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Too many requests, please try again later', ERROR_CODES.RATE_LIMITED, 429);
  },
});

export const authLimiter = rateLimit({
  windowMs,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX) || 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    sendError(res, 'Too many authentication attempts, please try again later', ERROR_CODES.RATE_LIMITED, 429);
  },
});
