import type { WebSocket } from 'ws';

/**
 * Extended WebSocket with authenticated user data attached at connection time.
 * All handler functions receive this type — userId/role/athleteId are guaranteed
 * to be present because unauthenticated sockets are rejected before any handler
 * is invoked.
 */
export interface AuthenticatedSocket extends WebSocket {
  userId: string;
  role: string;
  athleteId: string | undefined;
  isAlive: boolean;
}

// ─── Message envelope ─────────────────────────────────────────────────────────

/**
 * Shape of every inbound message from the client.
 * requestId is echoed back in all outbound messages for the same request so
 * the client can correlate streaming chunks with the originating call.
 */
export interface InboundMessage {
  type: string;
  payload: Record<string, unknown>;
  requestId?: string;
}

/**
 * Shape of every outbound message to the client.
 */
export interface OutboundMessage {
  type: string;
  payload: unknown;
  requestId?: string;
  error?: string;
}

// ─── Handler function signature ───────────────────────────────────────────────

/**
 * Each domain handler implements this signature.
 * Returning void is expected — responses are sent directly via socket.send().
 */
export type WsHandler = (
  socket: AuthenticatedSocket,
  payload: Record<string, unknown>,
  requestId: string | undefined,
) => Promise<void>;

/**
 * Registry entry: maps event type strings to handler functions.
 * Each domain file exports one record of this shape.
 */
export type HandlerMap = Record<string, WsHandler>;
