// Load env first — nothing else imports before this
import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

import { connectDB } from './db/pool';
import { initWebSocketServer } from './websocket/server';
import { initScheduler } from './services/scheduler';
import { globalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import { API_PREFIX } from './utils/constants';
import logger from './utils/logger';

import authRoutes from './routes/auth';
import athleteRoutes from './routes/athlete';
import coachRoutes from './routes/coach';
import parentRoutes from './routes/parent';
import chatRoutes from './routes/chat';
import subscriptionRoutes from './routes/subscription.routes';

const PORT = Number(process.env.PORT) || 3000;
const ENV = process.env.NODE_ENV ?? 'development';

async function bootstrap(): Promise<void> {
  // ── Database (fail fast) ──────────────────────────────────────────────────
  await connectDB();

  // ── Express app ───────────────────────────────────────────────────────────
  const app = express();

  // Security headers — CSP stripped down for a JSON API
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // CORS — only the mobile app origin and admin domain
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no Origin (mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type'],
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '512kb' }));
  app.use(express.urlencoded({ extended: false }));

  // ── Global rate limiter ───────────────────────────────────────────────────
  app.use(globalLimiter);

  // ── Health check (no auth, no rate limit overhead) ────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', env: ENV, timestamp: new Date().toISOString() });
  });

  // ── API routes ────────────────────────────────────────────────────────────
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/athletes`, athleteRoutes);
  app.use(`${API_PREFIX}/coaches`, coachRoutes);
  app.use(`${API_PREFIX}/parents`, parentRoutes);
  app.use(`${API_PREFIX}/chat`, chatRoutes);
  app.use(`${API_PREFIX}/subscription`, subscriptionRoutes);

  // 404 handler — must be after all routes
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      data: null,
      error: 'Route not found',
      code: 'NOT_FOUND',
    });
  });

  // Centralised error handler — must be last
  app.use(errorHandler);

  // ── HTTP + WebSocket server ───────────────────────────────────────────────
  const server = http.createServer(app);
  initWebSocketServer(server);

  // ── Scheduled tasks ───────────────────────────────────────────────────────
  if (ENV !== 'test') {
    initScheduler();
  }

  server.listen(PORT, () => {
    logger.info('SprintFastest API started', {
      env: ENV,
      port: PORT,
      apiPrefix: API_PREFIX,
    });
  });

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      logger.info('HTTP server closed');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason });
  });
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  // Can't use logger here — DB might not be up yet
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
