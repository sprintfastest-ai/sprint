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
