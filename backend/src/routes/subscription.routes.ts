import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '@/middleware/auth';
import { requireRole } from '@/middleware/auth';
import { validate } from '@/middleware/validate';
import {
  webhookHandler,
  statusHandler,
  adminGrantHandler,
} from '@/controllers/subscription.controller';

const router = Router();

/**
 * POST /api/v1/subscription/webhook
 *
 * RevenueCat webhook receiver. Unauthenticated — verified by the
 * Authorization header matching REVENUECAT_WEBHOOK_SECRET instead.
 *
 * RevenueCat must be configured to send the secret in the Authorization header.
 * Docs: https://www.revenuecat.com/docs/integrations/webhooks
 */
router.post('/webhook', webhookHandler);

/**
 * GET /api/v1/subscription/status
 *
 * Returns the authenticated user's subscription plan, status, and the
 * full list of feature keys they currently have access to.
 */
router.get('/status', authenticate, statusHandler);

/**
 * POST /api/v1/subscription/grant
 *
 * Admin-only endpoint to grant a specific feature to any user.
 * Requires admin role — never expose this without authentication.
 */
router.post(
  '/grant',
  authenticate,
  requireRole('admin'),
  [
    body('userId').isUUID().withMessage('userId must be a valid UUID.'),
    body('feature').notEmpty().withMessage('feature is required.'),
    body('expiresAt')
      .optional()
      .isISO8601()
      .withMessage('expiresAt must be a valid ISO 8601 date.'),
  ],
  validate,
  adminGrantHandler,
);

export default router;
