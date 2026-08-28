import { getTokensForUser, getTokensForUsers, deletePushTokens } from '@/db/queries/pushTokens';
import { insertNotification, insertNotificationForUsers } from '@/db/queries/notifications';
import logger from '@/utils/logger';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
const CHUNK_SIZE = 100;

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface ExpoPushMessage extends PushPayload {
  to: string;
}

interface ExpoPushTicket {
  status: 'ok' | 'error';
  message?: string;
  details?: { error?: string };
}

async function sendExpoMessages(messages: ExpoPushMessage[]): Promise<void> {
  if (!messages.length) return;

  const invalidTokens: string[] = [];

  for (let i = 0; i < messages.length; i += CHUNK_SIZE) {
    const chunk = messages.slice(i, i + CHUNK_SIZE);
    try {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(chunk),
      });
      const json = (await res.json()) as { data?: ExpoPushTicket[] };
      (json.data ?? []).forEach((ticket, idx) => {
        if (ticket.status === 'error' && ticket.details?.error === 'DeviceNotRegistered') {
          const badToken = chunk[idx]?.to;
          if (badToken) invalidTokens.push(badToken);
        }
      });
    } catch (err) {
      logger.error('Expo push send failed', { error: (err as Error).message });
    }
  }

  if (invalidTokens.length) {
    await deletePushTokens(invalidTokens);
  }
}

function notificationType(payload: PushPayload): string {
  const type = payload.data?.type;
  return typeof type === 'string' && type ? type : 'general';
}

// Always persists a notification row, independent of whether the user has
// a registered push token or granted push permission — the in-app
// notification list (the bell icon) needs to be complete even for someone
// running with push disabled, not just a record of what was actually
// pushed to a device.
export async function notifyUser(userId: string, payload: PushPayload): Promise<void> {
  const [tokens] = await Promise.all([
    getTokensForUser(userId),
    insertNotification(userId, payload.title, payload.body, notificationType(payload), payload.data ?? {})
      .catch((err) => logger.error('Failed to persist notification', { userId, error: (err as Error).message })),
  ]);
  await sendExpoMessages(tokens.map((to) => ({ to, ...payload })));
}

export async function notifyUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (!userIds.length) return;
  const [tokens] = await Promise.all([
    getTokensForUsers(userIds),
    insertNotificationForUsers(userIds, payload.title, payload.body, notificationType(payload), payload.data ?? {})
      .catch((err) => logger.error('Failed to persist notifications', { count: userIds.length, error: (err as Error).message })),
  ]);
  await sendExpoMessages(tokens.map((to) => ({ to, ...payload })));
}
