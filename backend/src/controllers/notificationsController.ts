import type { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES } from '@/utils/constants';
import { upsertPushToken, deletePushToken } from '@/db/queries/pushTokens';
import {
  getNotificationsForUser,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/db/queries/notifications';

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

export async function listNotifications(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Number(req.query.offset) || 0;

    const [notifications, unreadCount] = await Promise.all([
      getNotificationsForUser(userId, limit, offset),
      getUnreadCount(userId),
    ]);

    sendSuccess(res, {
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        type: n.type,
        data: n.data,
        isRead: n.is_read,
        createdAt: n.created_at,
      })),
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
}

export async function markRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    const { notificationId } = req.params as { notificationId: string };
    const found = await markNotificationRead(userId, notificationId);
    if (!found) throw new AppError('Notification not found', ERROR_CODES.NOT_FOUND, 404);

    sendSuccess(res, { read: true });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);

    await markAllNotificationsRead(userId);
    sendSuccess(res, { read: true });
  } catch (err) {
    next(err);
  }
}
