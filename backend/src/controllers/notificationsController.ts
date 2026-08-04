import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import { upsertPushToken, deletePushToken } from '@/db/queries/pushTokens';

export async function registerToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { token, platform } = req.body as { token: string; platform: 'ios' | 'android' };
    await upsertPushToken(userId, token, platform);
    sendSuccess(res, { registered: true }, 201);
  } catch (err) {
    next(err);
  }
}

export async function unregisterToken(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { token } = req.body as { token: string };
    await deletePushToken(token);
    sendSuccess(res, { unregistered: true });
  } catch (err) {
    next(err);
  }
}
