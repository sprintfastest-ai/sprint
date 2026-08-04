import { getTokensForUser, getTokensForUsers, deletePushTokens } from '@/db/queries/pushTokens';
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

export async function notifyUser(userId: string, payload: PushPayload): Promise<void> {
  const tokens = await getTokensForUser(userId);
  await sendExpoMessages(tokens.map((to) => ({ to, ...payload })));
}

export async function notifyUsers(userIds: string[], payload: PushPayload): Promise<void> {
  if (!userIds.length) return;
  const tokens = await getTokensForUsers(userIds);
  await sendExpoMessages(tokens.map((to) => ({ to, ...payload })));
}
