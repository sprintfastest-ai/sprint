import { WebSocket } from 'ws';
import type { AuthenticatedSocket, OutboundMessage } from './types';
import logger from '@/utils/logger';

/**
 * Single connection registry for the lifetime of the process.
 *
 * Invariant: at most one socket per userId — if a user reconnects the old
 * socket is closed with code 4001 before the new one is registered.
 * This matches the mobile app's single-session model.
 */
const registry = new Map<string, AuthenticatedSocket>();

// ─── Registration ─────────────────────────────────────────────────────────────

/**
 * Registers a newly authenticated socket. If the user already has a live
 * connection it is closed (code 4001) and replaced — only one session per user.
 *
 * Called by server.ts immediately after JWT verification succeeds.
 *
 * @param socket - The authenticated socket to register.
 */
export function registerSocket(socket: AuthenticatedSocket): void {
  const existing = registry.get(socket.userId);

  if (existing && existing.readyState === WebSocket.OPEN) {
    logger.info('Closing previous session — new connection from same user', {
      userId: socket.userId,
    });
    existing.close(4001, 'Replaced by new connection');
  }

  registry.set(socket.userId, socket);
  logger.debug('Socket registered', { userId: socket.userId, role: socket.role });
}

/**
 * Removes a socket from the registry on disconnection.
 *
 * Only removes the entry if the stored socket is the same object — guards
 * against a race where reconnect registers a new socket before the old
 * disconnect event fires.
 *
 * @param socket - The socket that has closed.
 */
export function deregisterSocket(socket: AuthenticatedSocket): void {
  const stored = registry.get(socket.userId);
  if (stored === socket) {
    registry.delete(socket.userId);
    logger.debug('Socket deregistered', { userId: socket.userId });
  }
}

// ─── Sending ──────────────────────────────────────────────────────────────────

/**
 * Serialises `message` and sends it to the user identified by `userId`.
 *
 * Silently no-ops if the user is not connected — callers do not need to
 * check `isConnected` before calling this.
 *
 * @param userId  - Target user's `users.id`.
 * @param message - The outbound message envelope to send.
 * @returns       `true` if the message was sent, `false` if the user was offline.
 */
export function sendToUser(userId: string, message: OutboundMessage): boolean {
  const socket = registry.get(userId);
  if (!socket || socket.readyState !== WebSocket.OPEN) return false;

  try {
    socket.send(JSON.stringify(message));
    return true;
  } catch (err) {
    logger.error('sendToUser failed', {
      userId,
      error: (err as Error).message,
    });
    return false;
  }
}

/**
 * Sends a message to a coach. Functionally identical to sendToUser — named
 * separately to make call sites self-documenting and to allow future fan-out
 * (e.g. coach with multiple browser tabs) without changing all call sites.
 *
 * @param coachId - The coach's `users.id`.
 * @param message - The outbound message envelope to send.
 * @returns       `true` if the message was delivered.
 */
export function broadcastToCoach(coachId: string, message: OutboundMessage): boolean {
  return sendToUser(coachId, message);
}

/**
 * Sends the same message to multiple users in a single pass.
 * Used for leaderboard updates, group notifications, etc.
 *
 * @param userIds - Array of `users.id` values to target.
 * @param message - The outbound message envelope to send.
 * @returns       Number of users actually reached (were online).
 */
export function multicast(userIds: string[], message: OutboundMessage): number {
  const serialised = JSON.stringify(message);
  let reached = 0;

  for (const userId of userIds) {
    const socket = registry.get(userId);
    if (socket?.readyState === WebSocket.OPEN) {
      try {
        socket.send(serialised);
        reached++;
      } catch (err) {
        logger.error('multicast send failed', {
          userId,
          error: (err as Error).message,
        });
      }
    }
  }

  return reached;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Returns whether a user currently has an open WebSocket connection.
 *
 * @param userId - The `users.id` to check.
 * @returns      `true` if the user has a live, open connection.
 */
export function isConnected(userId: string): boolean {
  const socket = registry.get(userId);
  return socket?.readyState === WebSocket.OPEN;
}

/**
 * Returns the number of currently connected users.
 * Useful for health checks and admin dashboards.
 */
export function connectionCount(): number {
  return registry.size;
}
