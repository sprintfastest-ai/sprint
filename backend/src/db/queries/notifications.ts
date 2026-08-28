import pool from '../pool';

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: Date;
}

export async function insertNotification(
  userId: string,
  title: string,
  body: string,
  type: string,
  data: Record<string, unknown> = {},
): Promise<NotificationRow> {
  const { rows } = await pool.query<NotificationRow>(
    `INSERT INTO notifications (user_id, title, body, type, data)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, title, body, type, JSON.stringify(data)],
  );
  return rows[0] as NotificationRow;
}

/** Bulk insert — one row per recipient, same title/body/type/data (session reminders etc.). */
export async function insertNotificationForUsers(
  userIds: string[],
  title: string,
  body: string,
  type: string,
  data: Record<string, unknown> = {},
): Promise<void> {
  if (!userIds.length) return;
  await pool.query(
    `INSERT INTO notifications (user_id, title, body, type, data)
     SELECT unnest($1::uuid[]), $2, $3, $4, $5`,
    [userIds, title, body, type, JSON.stringify(data)],
  );
}

export async function getNotificationsForUser(
  userId: string,
  limit: number,
  offset: number,
): Promise<NotificationRow[]> {
  const { rows } = await pool.query<NotificationRow>(
    `SELECT * FROM notifications
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return rows;
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND is_read = FALSE',
    [userId],
  );
  return Number(rows[0]?.count ?? 0);
}

/** Returns true if a row existed for this user (guards against marking someone else's notification). */
export async function markNotificationRead(userId: string, notificationId: string): Promise<boolean> {
  const { rowCount } = await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2',
    [notificationId, userId],
  );
  return (rowCount ?? 0) > 0;
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await pool.query(
    'UPDATE notifications SET is_read = TRUE WHERE user_id = $1 AND is_read = FALSE',
    [userId],
  );
}
