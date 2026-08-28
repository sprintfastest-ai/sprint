import client from './client';

/**
 * Sends an in-app "Contact Support" submission — emails the SprintFastest
 * team (backend/src/services/email.ts's sendSupportRequest) using the
 * authenticated user's own email as the reply-to, instead of opening the
 * device's mail app via a mailto: link.
 */
export async function contactSupport(subject: string, message: string): Promise<void> {
  await client.post('/support/contact', { subject, message });
}
