import { WebSocket } from 'ws';
import logger from '@/utils/logger';
import type { AuthenticatedSocket, HandlerMap, OutboundMessage } from '../types';

// ─── PHASE 3 STUB ─────────────────────────────────────────────────────────────
//
// This handler module is intentionally minimal. The event contract (type names,
// payload shapes, requestId echoing) is defined here and must not change in
// Phase 3 — only the internals of each handler function change.
//
// Phase 3 implementation notes (leave for the implementing engineer):
//   audio:start_session → allocate an audio pipeline session, return a session
//                         token the client uses to associate subsequent chunks.
//   audio:chunk         → decode base64 PCM, pass to speech-to-text, accumulate
//                         transcript. When a sentence boundary is detected, run
//                         the transcript through the AI coaching model, then
//                         synthesise a TTS reply and stream it back as
//                         'audio:reply_chunk' events (base64 PCM).
//   audio:end_session   → flush any partial transcript, release resources,
//                         persist the session summary.
// ─────────────────────────────────────────────────────────────────────────────

function send(socket: AuthenticatedSocket, msg: OutboundMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

// ─── Active stub sessions (Phase 3: replace with real pipeline state) ─────────

/** Tracks which users have an active audio session this connection. */
const activeSessions = new Map<string, { sessionId: string; startedAt: Date }>();

// ─── Event: audio:start_session ──────────────────────────────────────────────

/**
 * [STUB] Acknowledges the start of an audio coaching session.
 *
 * Phase 3: allocate speech-to-text pipeline, return a sessionId
 * the client attaches to every subsequent audio:chunk.
 *
 * Client  → { type: 'audio:start_session', payload: { language?: string }, requestId }
 * Server  → { type: 'audio:ready',         payload: { sessionId },         requestId }
 *
 * @param socket    - Authenticated sender.
 * @param payload   - Optional { language: string } (e.g. 'en-GB').
 * @param requestId - Echoed for client correlation.
 */
async function handleStartSession(
  socket: AuthenticatedSocket,
  payload: Record<string, unknown>,
  requestId: string | undefined,
): Promise<void> {
  const sessionId = `audio_${socket.userId}_${Date.now()}`;

  // Replace existing session if user starts a new one without ending the last
  if (activeSessions.has(socket.userId)) {
    logger.debug('audio:start_session — replacing existing stub session', {
      userId: socket.userId,
    });
  }

  activeSessions.set(socket.userId, { sessionId, startedAt: new Date() });

  logger.info('audio:start_session acknowledged (Phase 3 stub)', {
    userId: socket.userId,
    sessionId,
    language: payload.language ?? 'en-GB',
  });

  send(socket, {
    type: 'audio:ready',
    payload: {
      sessionId,
      message: 'Audio coaching session started. Speak your question.',
    },
    requestId,
  });
}

// ─── Event: audio:chunk ───────────────────────────────────────────────────────

/**
 * [STUB] Acknowledges receipt of an audio chunk. No processing in Phase 2.
 *
 * Phase 3: base64-decode `data`, feed PCM to the STT pipeline. Once a
 * sentence boundary is detected, trigger the AI coaching response and
 * stream back 'audio:reply_chunk' events.
 *
 * Client  → { type: 'audio:chunk', payload: { sessionId, data: base64, isFinal?: boolean }, requestId }
 * Server  → { type: 'audio:acknowledged', payload: { chunkIndex },                          requestId }
 *
 * @param socket    - Authenticated sender.
 * @param payload   - Must contain { sessionId: string, data: string (base64) }.
 * @param requestId - Echoed for client correlation.
 */
async function handleChunk(
  socket: AuthenticatedSocket,
  payload: Record<string, unknown>,
  requestId: string | undefined,
): Promise<void> {
  const { sessionId, data, isFinal } = payload as {
    sessionId?: string;
    data?: string;
    isFinal?: boolean;
  };

  if (!sessionId || !data) {
    send(socket, {
      type: 'audio:error',
      payload: { message: 'audio:chunk requires sessionId and data.' },
      requestId,
    });
    return;
  }

  // Validate session belongs to this user
  const session = activeSessions.get(socket.userId);
  if (!session || session.sessionId !== sessionId) {
    send(socket, {
      type: 'audio:error',
      payload: { message: 'No active audio session. Send audio:start_session first.' },
      requestId,
    });
    return;
  }

  const byteLength = Buffer.byteLength(data, 'base64');
  logger.debug('audio:chunk received (Phase 3 stub — not processed)', {
    userId: socket.userId,
    sessionId,
    byteLength,
    isFinal: isFinal ?? false,
  });

  send(socket, {
    type: 'audio:acknowledged',
    payload: { sessionId, byteLength },
    requestId,
  });
}

// ─── Event: audio:end_session ─────────────────────────────────────────────────

/**
 * [STUB] Ends the audio coaching session and releases resources.
 *
 * Phase 3: flush any partial transcript, generate a session summary,
 * persist to the DB, release STT pipeline.
 *
 * Client  → { type: 'audio:end_session', payload: { sessionId }, requestId }
 * Server  → { type: 'audio:session_ended', payload: { sessionId, duration }, requestId }
 *
 * @param socket    - Authenticated sender.
 * @param payload   - Must contain { sessionId: string }.
 * @param requestId - Echoed for client correlation.
 */
async function handleEndSession(
  socket: AuthenticatedSocket,
  payload: Record<string, unknown>,
  requestId: string | undefined,
): Promise<void> {
  const { sessionId } = payload as { sessionId?: string };
  const session = activeSessions.get(socket.userId);

  const durationMs = session
    ? Date.now() - session.startedAt.getTime()
    : 0;

  activeSessions.delete(socket.userId);

  logger.info('audio:end_session acknowledged (Phase 3 stub)', {
    userId: socket.userId,
    sessionId,
    durationMs,
  });

  send(socket, {
    type: 'audio:session_ended',
    payload: {
      sessionId: sessionId ?? session?.sessionId,
      durationMs,
    },
    requestId,
  });
}

// ─── Cleanup on disconnect ────────────────────────────────────────────────────

/**
 * Called by server.ts when a socket closes. Cleans up any dangling stub session
 * for the user. Phase 3: also flush/release the STT pipeline here.
 *
 * @param userId - The disconnected user's `users.id`.
 */
export function cleanupAudioSession(userId: string): void {
  if (activeSessions.has(userId)) {
    logger.debug('audio:session cleaned up on disconnect', { userId });
    activeSessions.delete(userId);
  }
}

// ─── Exported handler map ─────────────────────────────────────────────────────

/**
 * All WebSocket event types handled by this domain module.
 * Registered in server.ts at startup.
 */
export const audioHandlers: HandlerMap = {
  'audio:start_session': handleStartSession,
  'audio:chunk': handleChunk,
  'audio:end_session': handleEndSession,
};
