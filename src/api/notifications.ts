import client from './client';

export async function registerPushToken(
  token: string,
  platform: 'ios' | 'android',
): Promise<void> {
  await client.post('/notifications/register-token', { token, platform });
}

export async function unregisterPushToken(token: string): Promise<void> {
  await client.delete('/notifications/register-token', { data: { token } });
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  /** e.g. 'badge_unlocked' | 'coach_note' | 'session_reminder' — see push.service.ts's callers. */
  type: string;
  data: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export async function getNotifications(
  limit = 20,
  offset = 0,
): Promise<{ notifications: AppNotification[]; unreadCount: number }> {
  const { data: body } = await client.get<{ data: { notifications: AppNotification[]; unreadCount: number } }>(
    '/notifications',
    { params: { limit, offset } },
  );
  return body.data;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await client.patch(`/notifications/${notificationId}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await client.patch('/notifications/read-all');
}
