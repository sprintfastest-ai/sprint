import { WebSocket } from 'ws';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/db/pool';
import { isPremium } from '@/db/queries/subscriptions';
import logger from '@/utils/logger';
import type { AuthenticatedSocket, HandlerMap, OutboundMessage } from '../types';

// ─── Voice Chat (beta) ──────────────────────────────────────────────────────
//
// A client records one complete voice message (expo-av can't stream raw PCM
// in real time), splits its base64 into pieces that fit the audio:chunk wire
// contract, and sends them in sequence. This handler reassembles the pieces
// and, on audio:end_session, sends the whole clip to Gemini in one call —
// Gemini transcribes and answers in the same pass, so no separate
// speech-to-text service is needed. The AI's reply is text; the client
// speaks it aloud on-device (expo-speech) rather than the server
// synthesising and streaming back audio — see src/hooks/useAudioChat.ts.
//
// Voice messages are persisted into the same chat_messages table as typed
// chat (role='user'/'assistant', session_id='voice') so they show up in the
// athlete's unified chat history, and they count against the same daily
// free-tier message limit as typed chat — otherwise voice would be an
// unmetered backdoor around it.
// ─────────────────────────────────────────────────────────────────────────────

const FREE_DAILY_CHAT_LIMIT = 15;

/** Roughly 6 minutes of 64kbps mono AAC — a generous cap for a "voice message". */
const MAX_BASE64_CHARS = 4 * 1024 * 1024;

const SUPPORTED_MIME_TYPES = new Set(['audio/mp4', 'audio/aac', 'audio/wav', 'audio/webm', 'audio/3gpp']);
const DEFAULT_MIME_TYPE = 'audio/mp4';

function send(socket: AuthenticatedSocket, msg: OutboundMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

interface AudioSession {
  sessionId: string;
  startedAt: Date;
  mimeType: string;
  chunks: string[];
  base64Length: number;
}

/** Tracks each user's in-progress recording upload for this connection. */
const activeSessions = new Map<string, AudioSession>();

// ─── Gemini call ──────────────────────────────────────────────────────────────

function getModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash-lite-preview-06-17',
  });
}

const SYSTEM_PROMPT = `You are an expert sprint coaching assistant for SprintFastest, listening to a voice
message from the athlete. Be concise (≤ 120 words unless the athlete asks for detail), encouraging, and
evidence-based. Only answer questions about sprint training, biomechanics, recovery, nutrition for sprinters,
race preparation, and mental performance. Gently redirect off-topic questions. Address the athlete directly.
Never claim to be human.

Reply in EXACTLY this format, with nothing else before or after:
TRANSCRIPT: <a verbatim transcription of what the athlete said in the audio>
REPLY: <your coaching response, addressed directly to the athlete>`;

interface AthleteProfileRow {
  age_group: string | null;
  primary_event: string | null;
  weakness_type: string | null;
}

interface PersonalBestRow {
  distance_metres: number;
  time_seconds: number;
}

async function buildAthleteContext(athleteId: string): Promise<string> {
  const [profileRes, pbRes] = await Promise.all([
    pool.query<AthleteProfileRow>(
      'SELECT age_group, primary_event, weakness_type FROM athlete_profiles WHERE id = $1 LIMIT 1',
      [athleteId],
    ),
    pool.query<PersonalBestRow>(
      'SELECT distance_metres, time_seconds FROM personal_bests WHERE athlete_id = $1 AND is_current_pb = TRUE ORDER BY distance_metres ASC',
      [athleteId],
    ),
  ]);

  const profile = profileRes.rows[0];
  if (!profile) return '';

  const parts: string[] = [];
  if (profile.age_group) parts.push(`Age group: ${profile.age_group}`);
  if (profile.primary_event) parts.push(`Primary event: ${profile.primary_event}`);
  if (profile.weakness_type) parts.push(`Current weakness: ${profile.weakness_type.replace(/_/g, ' ')}`);
  if (pbRes.rows.length) {
    parts.push(`Personal bests: ${pbRes.rows.map((pb) => `${pb.distance_metres}m in ${pb.time_seconds}s`).join(', ')}`);
  }

  return parts.length ? `\n\nAthlete profile: ${parts.join(', ')}.` : '';
}

/**
 * Mirrors chatController.ts's history query (no session_id filter) so a
 * voice reply has the athlete's full recent conversation as context,
 * whether prior turns were typed or spoken.
 */
async function fetchRecentHistory(
  athleteId: string,
  limit = 10,
): Promise<Array<{ role: 'user' | 'model'; parts: [{ text: string }] }>> {
  const { rows } = await pool.query<{ role: string; content: string }>(
    `SELECT role, content FROM chat_messages
     WHERE athlete_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [athleteId, limit],
  );
  return rows
    .reverse()
    .map((r) => ({
      role: r.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: r.content }] as [{ text: string }],
    }));
}

async function persistExchange(athleteId: string, transcript: string, reply: string): Promise<void> {
  await pool.query(
    `INSERT INTO chat_messages (athlete_id, session_id, role, content)
     VALUES ($1, 'voice', 'user', $2), ($1, 'voice', 'assistant', $3)`,
    [athleteId, transcript || '(voice message)', reply],
  );
}

function parseAudioReply(raw: string): { transcript: string; content: string } {
  const transcriptMatch = raw.match(/TRANSCRIPT:\s*([\s\S]*?)\n *REPLY:/i);
  const replyMatch = raw.match(/REPLY:\s*([\s\S]*)$/i);
  if (transcriptMatch && replyMatch) {
    return { transcript: transcriptMatch[1].trim(), content: replyMatch[1].trim() };
  }
  // Gemini didn't follow the format — fall back to showing the whole reply.
  return { transcript: '', content: raw.trim() };
}

/**
 * Sends the assembled recording to Gemini, gets back a transcript + coaching
 * reply, persists the exchange, and pushes 'audio:reply_complete'.
 * Runs after audio:session_ended has already been acked.
 */
async function processRecording(
  socket: AuthenticatedSocket,
  athleteId: string,
  base64Audio: string,
  mimeType: string,
  requestId: string | undefined,
): Promise<void> {
  try {
    if (!(await isPremium(socket.userId))) {
      const { rows: countRows } = await pool.query<{ count: number }>(
        `SELECT COUNT(*)::int AS count FROM chat_messages
         WHERE athlete_id = $1 AND role = 'user' AND created_at >= CURRENT_DATE`,
        [athleteId],
      );
      if ((countRows[0]?.count ?? 0) >= FREE_DAILY_CHAT_LIMIT) {
        send(socket, {
          type: 'audio:error',
          payload: {
            message: `You've reached today's free chat limit (${FREE_DAILY_CHAT_LIMIT} messages). Upgrade to Premium for unlimited AI coaching.`,
          },
          requestId,
        });
        return;
      }
    }

    const history = await fetchRecentHistory(athleteId);
    const athleteContext = await buildAthleteContext(athleteId);

    const model = getModel();
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT + athleteContext }] },
        {
          role: 'model',
          parts: [{ text: "Understood. I'm listening for the athlete's voice message and will transcribe and reply in the required format." }],
        },
        ...history,
      ],
    });

    const t0 = Date.now();
    const result = await chat.sendMessage([{ inlineData: { mimeType, data: base64Audio } }]);
    const raw = result.response.text();
    const { transcript, content } = parseAudioReply(raw);

    logger.info('audio: Gemini voice reply generated', {
      userId: socket.userId,
      latencyMs: Date.now() - t0,
      transcriptLength: transcript.length,
      replyLength: content.length,
    });

    await persistExchange(athleteId, transcript, content);

    send(socket, {
      type: 'audio:reply_complete',
      payload: { transcript, content },
      requestId,
    });
  } catch (err) {
    logger.error('audio: voice reply failed', {
      userId: socket.userId,
      error: (err as Error).message,
    });
    send(socket, {
      type: 'audio:error',
      payload: { message: 'The AI coach could not process that voice message. Please try again.' },
      requestId,
    });
  }
}

// ─── Event: audio:start_session ──────────────────────────────────────────────

/**
 * Client  → { type: 'audio:start_session', payload: { language?: string, mimeType?: string }, requestId }
 * Server  → { type: 'audio:ready',         payload: { sessionId },                            requestId }
 */
async function handleStartSession(
  socket: AuthenticatedSocket,
  payload: Record<string, unknown>,
  requestId: string | undefined,
): Promise<void> {
  const sessionId = `audio_${socket.userId}_${Date.now()}`;
  const requestedMimeType = payload.mimeType as string | undefined;
  const mimeType = requestedMimeType && SUPPORTED_MIME_TYPES.has(requestedMimeType) ? requestedMimeType : DEFAULT_MIME_TYPE;

  if (requestedMimeType && mimeType !== requestedMimeType) {
    logger.warn('audio:start_session — unrecognised mimeType, defaulting', {
      userId: socket.userId,
      requestedMimeType,
    });
  }

  activeSessions.set(socket.userId, { sessionId, startedAt: new Date(), mimeType, chunks: [], base64Length: 0 });

  logger.info('audio:start_session', { userId: socket.userId, sessionId, mimeType, language: payload.language ?? 'en-GB' });

  send(socket, {
    type: 'audio:ready',
    payload: { sessionId, message: 'Audio coaching session started. Speak your question.' },
    requestId,
  });
}

// ─── Event: audio:chunk ───────────────────────────────────────────────────────

/**
 * Client  → { type: 'audio:chunk', payload: { sessionId, data: base64, isFinal?: boolean }, requestId }
 * Server  → { type: 'audio:acknowledged', payload: { sessionId, byteLength },                requestId }
 */
async function handleChunk(
  socket: AuthenticatedSocket,
  payload: Record<string, unknown>,
  requestId: string | undefined,
): Promise<void> {
  const { sessionId, data } = payload as { sessionId?: string; data?: string; isFinal?: boolean };

  if (!sessionId || !data) {
    send(socket, { type: 'audio:error', payload: { message: 'audio:chunk requires sessionId and data.' }, requestId });
    return;
  }

  const session = activeSessions.get(socket.userId);
  if (!session || session.sessionId !== sessionId) {
    send(socket, { type: 'audio:error', payload: { message: 'No active audio session. Send audio:start_session first.' }, requestId });
    return;
  }

  if (session.base64Length + data.length > MAX_BASE64_CHARS) {
    activeSessions.delete(socket.userId);
    send(socket, { type: 'audio:error', payload: { message: 'Voice message is too long. Please keep it under a few minutes.' }, requestId });
    return;
  }

  session.chunks.push(data);
  session.base64Length += data.length;

  send(socket, {
    type: 'audio:acknowledged',
    payload: { sessionId, byteLength: Buffer.byteLength(data, 'base64') },
    requestId,
  });
}

// ─── Event: audio:end_session ─────────────────────────────────────────────────

/**
 * Client  → { type: 'audio:end_session', payload: { sessionId }, requestId }
 * Server  → { type: 'audio:session_ended', payload: { sessionId, durationMs }, requestId }
 * Server  → { type: 'audio:reply_complete', payload: { transcript, content }, requestId } (async, follows)
 */
async function handleEndSession(
  socket: AuthenticatedSocket,
  payload: Record<string, unknown>,
  requestId: string | undefined,
): Promise<void> {
  const { sessionId } = payload as { sessionId?: string };
  const session = activeSessions.get(socket.userId);
  activeSessions.delete(socket.userId);

  const durationMs = session ? Date.now() - session.startedAt.getTime() : 0;

  logger.info('audio:end_session', { userId: socket.userId, sessionId, durationMs, chunkCount: session?.chunks.length ?? 0 });

  send(socket, {
    type: 'audio:session_ended',
    payload: { sessionId: sessionId ?? session?.sessionId, durationMs },
    requestId,
  });

  if (!session || session.chunks.length === 0) {
    send(socket, { type: 'audio:error', payload: { message: 'No audio was received.' }, requestId });
    return;
  }

  if (!socket.athleteId) {
    send(socket, { type: 'audio:error', payload: { message: 'Only athletes can use voice coaching.' }, requestId });
    return;
  }

  const base64Audio = session.chunks.join('');
  await processRecording(socket, socket.athleteId, base64Audio, session.mimeType, requestId);
}

// ─── Cleanup on disconnect ────────────────────────────────────────────────────

/**
 * Called by server.ts when a socket closes. Drops any in-progress upload for
 * the user — a recording mid-flight when the socket drops is simply lost.
 */
export function cleanupAudioSession(userId: string): void {
  if (activeSessions.has(userId)) {
    logger.debug('audio:session cleaned up on disconnect', { userId });
    activeSessions.delete(userId);
  }
}

// ─── Exported handler map ─────────────────────────────────────────────────────

export const audioHandlers: HandlerMap = {
  'audio:start_session': handleStartSession,
  'audio:chunk': handleChunk,
  'audio:end_session': handleEndSession,
};
