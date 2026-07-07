import { GoogleGenerativeAI } from '@google/generative-ai';
import { WebSocket } from 'ws';
import pool from '@/db/pool';
import logger from '@/utils/logger';
import type { AuthenticatedSocket, HandlerMap, OutboundMessage } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function send(socket: AuthenticatedSocket, msg: OutboundMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

function getStreamingModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite-preview-06-17',
  });
}

/**
 * Fetches the last N chat messages for a session from the DB to rebuild
 * Gemini's conversation history. We keep history shallow (10 turns) to
 * control token spend; older context is not needed for coaching Q&A.
 */
async function fetchHistory(
  athleteId: string,
  sessionId: string,
  limit = 10,
): Promise<Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>> {
  const { rows } = await pool.query<{ role: string; content: string }>(
    `SELECT role, content FROM chat_messages
     WHERE athlete_id = $1 AND session_id = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [athleteId, sessionId, limit],
  );

  // Rows come back newest-first; reverse so oldest is first for Gemini
  return rows
    .reverse()
    .map((r) => ({
      role: r.role === 'user' ? 'user' : 'model',
      parts: [{ text: r.content }] as [{ text: string }],
    }));
}

/**
 * Persists both the user message and the fully assembled assistant reply to
 * the chat_messages table so history can be rebuilt on reconnect.
 */
async function persistMessages(
  athleteId: string,
  sessionId: string,
  userMessage: string,
  assistantReply: string,
): Promise<void> {
  await pool.query(
    `INSERT INTO chat_messages (athlete_id, session_id, role, content)
     VALUES ($1, $2, 'user', $3), ($1, $2, 'assistant', $4)`,
    [athleteId, sessionId, userMessage, assistantReply],
  );
}

// ─── System instruction ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert sprint coaching assistant for SprintFastest.
Be concise (≤ 120 words unless the athlete asks for detail), encouraging, and evidence-based.
Only answer questions about sprint training, biomechanics, recovery, nutrition for sprinters,
race preparation, and mental performance. Gently redirect off-topic questions.
Address the athlete directly. Never claim to be human.`;

// ─── Event: chat:send ─────────────────────────────────────────────────────────

/**
 * Handles a chat message from the athlete. Streams the AI response back as
 * a series of 'chat:token' events, then sends a single 'chat:complete' event
 * containing the full assembled reply once streaming is done.
 *
 * Flow:
 *   client  → { type: 'chat:send',     payload: { message, sessionId }, requestId }
 *   server  → { type: 'chat:token',    payload: { token },              requestId } × N
 *   server  → { type: 'chat:complete', payload: { content, sessionId }, requestId }
 *
 * On error:
 *   server  → { type: 'chat:error',    payload: { message },            requestId }
 *
 * @param socket    - Authenticated sender socket.
 * @param payload   - Must contain { message: string, sessionId: string }.
 * @param requestId - Echoed back on every outbound event for client correlation.
 */
async function handleChatSend(
  socket: AuthenticatedSocket,
  payload: Record<string, unknown>,
  requestId: string | undefined,
): Promise<void> {
  const message = payload.message as string | undefined;
  const sessionId = (payload.sessionId as string | undefined) ?? 'default';

  if (!message?.trim()) {
    send(socket, {
      type: 'chat:error',
      payload: { message: 'message is required.' },
      requestId,
    });
    return;
  }

  // athleteId is embedded in the JWT; if missing this user is not an athlete
  if (!socket.athleteId) {
    send(socket, {
      type: 'chat:error',
      payload: { message: 'Only athletes can use the AI coach.' },
      requestId,
    });
    return;
  }

  logger.debug('chat:send received', {
    userId: socket.userId,
    sessionId,
    messageLength: message.length,
  });

  try {
    const history = await fetchHistory(socket.athleteId, sessionId);

    const model = getStreamingModel();
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: "Understood. I'm your sprint coach — ask me anything about training, recovery, or race prep." }],
        },
        ...history,
      ],
    });

    const streamResult = await chat.sendMessageStream(message);

    let fullReply = '';

    // Stream tokens as they arrive
    for await (const chunk of streamResult.stream) {
      const token = chunk.text();
      if (!token) continue;
      fullReply += token;

      send(socket, {
        type: 'chat:token',
        payload: { token },
        requestId,
      });

      // If the socket closed mid-stream, abort cleanly
      if (socket.readyState !== WebSocket.OPEN) {
        logger.debug('chat:send aborted — socket closed mid-stream', {
          userId: socket.userId,
        });
        return;
      }
    }

    // Persist both sides to DB (fire-and-forget — don't fail the WS response)
    persistMessages(socket.athleteId, sessionId, message, fullReply).catch((err: unknown) =>
      logger.error('Failed to persist chat messages', {
        userId: socket.userId,
        error: (err as Error).message,
      }),
    );

    send(socket, {
      type: 'chat:complete',
      payload: { content: fullReply, sessionId },
      requestId,
    });

    logger.debug('chat:send complete', {
      userId: socket.userId,
      sessionId,
      replyLength: fullReply.length,
    });
  } catch (err) {
    logger.error('chat:send error', {
      userId: socket.userId,
      error: (err as Error).message,
    });
    send(socket, {
      type: 'chat:error',
      payload: { message: 'The AI coach is temporarily unavailable. Please try again.' },
      requestId,
    });
  }
}

// ─── Exported handler map ─────────────────────────────────────────────────────

/**
 * All WebSocket event types handled by this domain module.
 * Registered in server.ts at startup.
 */
export const chatHandlers: HandlerMap = {
  'chat:send': handleChatSend,
};
