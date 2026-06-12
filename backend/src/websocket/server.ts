import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger';
import type { JwtPayload } from '@/types';
import type { AuthenticatedSocket, InboundMessage, OutboundMessage, HandlerMap } from './types';
import { registerSocket, deregisterSocket } from './registry';
import { chatHandlers } from './handlers/chat.handler';
import { audioHandlers, cleanupAudioSession } from './handlers/audio.handler';

// ─── Combined handler registry ────────────────────────────────────────────────

/**
 * All domain handler maps merged into a single dispatch table.
 * Adding a new domain in Phase N: import its HandlerMap and spread it here.
 * No other file needs to change.
 */
const HANDLERS: HandlerMap = {
  ...chatHandlers,
  ...audioHandlers,
};

// ─── Heartbeat ────────────────────────────────────────────────────────────────

const HEARTBEAT_INTERVAL_MS = 30_000;

function startHeartbeat(wss: WebSocketServer): NodeJS.Timeout {
  return setInterval(() => {
    wss.clients.forEach((raw) => {
      const socket = raw as AuthenticatedSocket;

      if (!socket.isAlive) {
        // No pong received since last ping — connection is stale
        logger.debug('Terminating stale WebSocket', { userId: socket.userId });
        deregisterSocket(socket);
        cleanupAudioSession(socket.userId);
        socket.terminate();
        return;
      }

      socket.isAlive = false;
      socket.ping();
    });
  }, HEARTBEAT_INTERVAL_MS);
}

// ─── Message sending helpers ──────────────────────────────────────────────────

function sendRaw(socket: WebSocket, msg: OutboundMessage): void {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  }
}

// ─── Connection handler ───────────────────────────────────────────────────────

function handleConnection(rawSocket: WebSocket, req: http.IncomingMessage): void {
  // ── 1. JWT authentication ────────────────────────────────────────────────

  const url = new URL(req.url ?? '', `http://${req.headers.host ?? 'localhost'}`);
  const token = url.searchParams.get('token');

  if (!token) {
    rawSocket.close(1008, 'Missing token');
    return;
  }

  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
  } catch (err) {
    logger.debug('WebSocket auth failed', { error: (err as Error).message });
    rawSocket.close(1008, 'Invalid or expired token');
    return;
  }

  // ── 2. Attach user data ───────────────────────────────────────────────────

  const socket = rawSocket as AuthenticatedSocket;
  socket.userId    = payload.userId;
  socket.role      = payload.role;
  socket.athleteId = payload.athleteId;
  socket.isAlive   = true;

  // ── 3. Register (closes any existing session for this user) ──────────────

  registerSocket(socket);

  logger.info('WebSocket connected', {
    userId: socket.userId,
    role: socket.role,
    hasAthleteId: !!socket.athleteId,
  });

  // Acknowledge the connection so the client knows auth succeeded
  sendRaw(socket, { type: 'connection:established', payload: { userId: socket.userId } });

  // ── 4. Pong handler (heartbeat response) ─────────────────────────────────

  socket.on('pong', () => {
    socket.isAlive = true;
  });

  // ── 5. Message dispatcher ─────────────────────────────────────────────────

  socket.on('message', (data) => {
    let msg: InboundMessage;

    try {
      msg = JSON.parse(data.toString()) as InboundMessage;
    } catch {
      sendRaw(socket, {
        type: 'error',
        payload: { message: 'Invalid JSON — messages must be valid JSON objects.' },
      });
      return;
    }

    if (!msg.type || typeof msg.type !== 'string') {
      sendRaw(socket, {
        type: 'error',
        payload: { message: 'Missing or invalid "type" field.' },
        requestId: msg.requestId,
      });
      return;
    }

    // Built-in ping — no handler registration needed
    if (msg.type === 'ping') {
      sendRaw(socket, { type: 'pong', payload: {}, requestId: msg.requestId });
      return;
    }

    const handler = HANDLERS[msg.type];

    if (!handler) {
      logger.debug('WebSocket: unknown message type', {
        type: msg.type,
        userId: socket.userId,
      });
      sendRaw(socket, {
        type: 'error',
        payload: { message: `Unknown event type: "${msg.type}"` },
        requestId: msg.requestId,
      });
      return;
    }

    // Dispatch to handler — errors are caught here so one bad message
    // cannot crash the connection or the process
    handler(socket, msg.payload ?? {}, msg.requestId).catch((err: unknown) => {
      logger.error('WebSocket handler threw', {
        type: msg.type,
        userId: socket.userId,
        error: (err as Error).message,
      });
      sendRaw(socket, {
        type: 'error',
        payload: { message: 'An unexpected error occurred processing your request.' },
        requestId: msg.requestId,
        error: (err as Error).message,
      });
    });
  });

  // ── 6. Disconnect handler ─────────────────────────────────────────────────

  socket.on('close', (code, reason) => {
    deregisterSocket(socket);
    cleanupAudioSession(socket.userId);

    logger.info('WebSocket disconnected', {
      userId: socket.userId,
      code,
      reason: reason.toString(),
    });
  });

  // ── 7. Socket-level error handler ─────────────────────────────────────────

  socket.on('error', (err) => {
    // Log but do not re-throw — the 'close' event fires immediately after
    logger.error('WebSocket socket error', {
      userId: socket.userId,
      error: err.message,
    });
  });
}

// ─── Initialisation ───────────────────────────────────────────────────────────

let wss: WebSocketServer | null = null;
let heartbeatTimer: NodeJS.Timeout | null = null;

/**
 * Attaches a WebSocket server to an existing HTTP server on path `/ws`.
 * Must be called once during application bootstrap, after the HTTP server
 * has been created but before it starts listening.
 *
 * Authentication: every connection must supply `?token=<JWT>` in the URL.
 * Unauthenticated connections are closed with code 1008 before any event
 * handler is invoked.
 *
 * @param server - The Node.js HTTP server to attach to.
 * @returns      The configured WebSocketServer instance.
 */
export function initWebSocketServer(server: http.Server): WebSocketServer {
  if (wss) {
    logger.warn('initWebSocketServer called more than once — returning existing instance');
    return wss;
  }

  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', handleConnection);

  wss.on('error', (err) => {
    logger.error('WebSocketServer error', { error: err.message });
  });

  heartbeatTimer = startHeartbeat(wss);

  wss.on('close', () => {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
    logger.info('WebSocket server closed');
  });

  logger.info('WebSocket server initialised', {
    path: '/ws',
    heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS,
    handlers: Object.keys(HANDLERS),
  });

  return wss;
}

// ─── Re-exports (used by HTTP route handlers that push to connected clients) ──

export { sendToUser, broadcastToCoach, isConnected, connectionCount } from './registry';
