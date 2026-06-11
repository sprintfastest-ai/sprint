import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger';
import type { JwtPayload } from '@/types';

interface AuthenticatedSocket extends WebSocket {
  userId?: string;
  role?: string;
  isAlive: boolean;
}

let wss: WebSocketServer | null = null;

// userId → set of open sockets
const connections = new Map<string, Set<AuthenticatedSocket>>();

export function initWebSocketServer(server: http.Server): WebSocketServer {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (rawSocket: WebSocket, req) => {
    const socket = rawSocket as AuthenticatedSocket;
    socket.isAlive = true;

    // Authenticate via ?token= query param
    const url = new URL(req.url ?? '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      socket.close(1008, 'Unauthorized');
      return;
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
      socket.userId = payload.sub;
      socket.role = payload.role;
    } catch {
      socket.close(1008, 'Unauthorized');
      return;
    }

    // Register connection
    if (!connections.has(socket.userId)) {
      connections.set(socket.userId, new Set());
    }
    connections.get(socket.userId)?.add(socket);
    logger.debug('WebSocket connected', { userId: socket.userId });

    socket.on('pong', () => { socket.isAlive = true; });

    socket.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString()) as { type: string; payload?: unknown };
        handleClientMessage(socket, msg);
      } catch {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      }
    });

    socket.on('close', () => {
      if (socket.userId) {
        connections.get(socket.userId)?.delete(socket);
        if (connections.get(socket.userId)?.size === 0) {
          connections.delete(socket.userId);
        }
      }
      logger.debug('WebSocket disconnected', { userId: socket.userId });
    });
  });

  // Heartbeat every 30s
  const heartbeat = setInterval(() => {
    wss?.clients.forEach((rawSocket) => {
      const socket = rawSocket as AuthenticatedSocket;
      if (!socket.isAlive) {
        socket.terminate();
        return;
      }
      socket.isAlive = false;
      socket.ping();
    });
  }, 30_000);

  wss.on('close', () => clearInterval(heartbeat));

  logger.info('WebSocket server initialised');
  return wss;
}

function handleClientMessage(
  socket: AuthenticatedSocket,
  msg: { type: string; payload?: unknown },
): void {
  switch (msg.type) {
    case 'ping':
      socket.send(JSON.stringify({ type: 'pong' }));
      break;
    default:
      logger.debug('Unknown WS message type', { type: msg.type });
  }
}

export function pushToUser(userId: string, event: object): void {
  const sockets = connections.get(userId);
  if (!sockets) return;
  const payload = JSON.stringify(event);
  sockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(payload);
    }
  });
}

export function broadcastToAll(event: object): void {
  if (!wss) return;
  const payload = JSON.stringify(event);
  wss.clients.forEach((rawSocket) => {
    if (rawSocket.readyState === WebSocket.OPEN) {
      rawSocket.send(payload);
    }
  });
}
