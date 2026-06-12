import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { sendSuccess, sendError } from '@/utils/response';
import { AppError } from '@/middleware/errorHandler';
import { ERROR_CODES, FEATURES } from '@/utils/constants';
import {
  activatePremium,
  cancelPremium,
  expirePremium,
  getSubscriptionStatus,
  grantFeatureAccess,
  getAllAccessibleFeatures,
} from '@/services/access.service';
import { findUserByEmail } from '@/db/queries/users';
import logger from '@/utils/logger';

// ─── RevenueCat event types we handle ────────────────────────────────────────

const RC_EVENTS = {
  INITIAL_PURCHASE:   'INITIAL_PURCHASE',
  RENEWAL:            'RENEWAL',
  PRODUCT_CHANGE:     'PRODUCT_CHANGE',
  CANCELLATION:       'CANCELLATION',
  UNCANCELLATION:     'UNCANCELLATION',
  EXPIRATION:         'EXPIRATION',
  BILLING_ISSUE:      'BILLING_ISSUE',
} as const;

type RcEventType = (typeof RC_EVENTS)[keyof typeof RC_EVENTS];

interface RevenueCatWebhookBody {
  event: {
    type: RcEventType;
    app_user_id: string;       // We use email as the RevenueCat app_user_id
    expiration_at_ms?: number;
    purchased_at_ms?: number;
    period_type?: string;
    id: string;
  };
}

// ─── Webhook signature verification ──────────────────────────────────────────

function verifyRevenueCatSignature(req: Request): boolean {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;

  // If no secret is configured, skip verification in development only
  if (!secret) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('REVENUECAT_WEBHOOK_SECRET not set — skipping signature check in dev');
      return true;
    }
    return false;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) return false;

  // RevenueCat sends: Authorization: <secret>
  return crypto.timingSafeEqual(
    Buffer.from(authHeader),
    Buffer.from(secret),
  );
}

// ─── POST /api/v1/subscription/webhook ───────────────────────────────────────

/**
 * RevenueCat webhook handler.
 *
 * Always returns 200 to RevenueCat (even on business-logic errors) so it
 * does not retry indefinitely. Unexpected errors bubble to the error handler
 * which returns 500 — RevenueCat will retry those.
 *
 * Event handling:
 *   INITIAL_PURCHASE / RENEWAL / UNCANCELLATION → activate premium
 *   CANCELLATION                                 → mark cancelled, keep premium until period end
 *   EXPIRATION / BILLING_ISSUE (grace expired)   → expire, downgrade to free
 *   Others                                       → logged and acknowledged
 */
export async function webhookHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!verifyRevenueCatSignature(req)) {
      logger.warn('RevenueCat webhook signature verification failed', {
        ip: req.ip,
      });
      sendError(res, 'Invalid webhook signature.', ERROR_CODES.INVALID_WEBHOOK_SIGNATURE, 401);
      return;
    }

    const body = req.body as RevenueCatWebhookBody;
    const { event } = body;

    if (!event?.type || !event?.app_user_id) {
      logger.warn('RevenueCat webhook missing required fields', { body });
      sendSuccess(res, { received: true });
      return;
    }

    logger.info('RevenueCat webhook received', {
      eventType: event.type,
      eventId: event.id,
      appUserId: event.app_user_id,
    });

    // Resolve user by RevenueCat app_user_id (we set this to the user's email)
    const user = await findUserByEmail(event.app_user_id);
    if (!user) {
      logger.warn('RevenueCat webhook: user not found', { appUserId: event.app_user_id });
      // Return 200 so RevenueCat doesn't keep retrying for an unknown user
      sendSuccess(res, { received: true });
      return;
    }

    const periodStart = event.purchased_at_ms
      ? new Date(event.purchased_at_ms)
      : new Date();

    const periodEnd = event.expiration_at_ms
      ? new Date(event.expiration_at_ms)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    switch (event.type) {
      case RC_EVENTS.INITIAL_PURCHASE:
      case RC_EVENTS.RENEWAL:
      case RC_EVENTS.UNCANCELLATION:
        await activatePremium(user.id, event.app_user_id, periodStart, periodEnd);
        break;

      case RC_EVENTS.PRODUCT_CHANGE:
        // Treat as a renewal — new product, new period
        await activatePremium(user.id, event.app_user_id, periodStart, periodEnd);
        break;

      case RC_EVENTS.CANCELLATION:
        await cancelPremium(user.id, event.app_user_id, periodEnd);
        break;

      case RC_EVENTS.EXPIRATION:
      case RC_EVENTS.BILLING_ISSUE:
        await expirePremium(user.id, event.app_user_id);
        break;

      default:
        logger.debug('RevenueCat webhook: unhandled event type', { type: event.type });
    }

    sendSuccess(res, { received: true });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/subscription/status ─────────────────────────────────────────

/**
 * Returns the authenticated user's current subscription status and
 * the full list of features they are allowed to access.
 *
 * The mobile app calls this on launch and after any subscription change
 * to rebuild its local feature flag map.
 *
 * Response shape:
 *   {
 *     subscription: SubscriptionRow,
 *     features: string[]   // FEATURES values the user may use
 *   }
 */
export async function statusHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new AppError('Not authenticated.', ERROR_CODES.UNAUTHORIZED, 401);
    }

    const [subscription, features] = await Promise.all([
      getSubscriptionStatus(userId),
      getAllAccessibleFeatures(userId, req.user?.role),
    ]);

    sendSuccess(res, { subscription, features });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/subscription/grant — admin only ────────────────────────────

/**
 * Admin endpoint to grant a specific feature to any user.
 *
 * Body:
 *   { userId: string, feature: FEATURES, expiresAt?: string (ISO date) }
 *
 * Use cases:
 *   - Give a coach free COACH_DASHBOARD access permanently
 *   - Grant a promotional trial of AUDIO_COACHING
 *   - Override access for QA / testing
 */
export async function adminGrantHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const {
      userId,
      feature,
      expiresAt,
    } = req.body as {
      userId: string;
      feature: FEATURES;
      expiresAt?: string;
    };

    if (!userId || !feature) {
      throw new AppError(
        'userId and feature are required.',
        ERROR_CODES.BAD_REQUEST,
        400,
      );
    }

    if (!Object.values(FEATURES).includes(feature)) {
      throw new AppError(
        `Invalid feature. Must be one of: ${Object.values(FEATURES).join(', ')}`,
        ERROR_CODES.VALIDATION_ERROR,
        422,
      );
    }

    const row = await grantFeatureAccess(
      userId,
      feature,
      `admin:${req.user?.userId ?? 'unknown'}`,
      expiresAt ? new Date(expiresAt) : undefined,
    );

    logger.info('Admin feature grant applied', {
      grantedBy: req.user?.userId,
      targetUserId: userId,
      feature,
      expiresAt,
    });

    sendSuccess(res, row, 201);
  } catch (err) {
    next(err);
  }
}
