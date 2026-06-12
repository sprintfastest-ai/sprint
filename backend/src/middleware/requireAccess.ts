import type { Request, Response, NextFunction } from 'express';
import { hasAccess } from '@/services/access.service';
import { sendError } from '@/utils/response';
import { ERROR_CODES, FEATURES } from '@/utils/constants';
import logger from '@/utils/logger';

/**
 * Express middleware factory that gates a route behind a specific feature flag.
 *
 * Must be used **after** `authenticate` so that `req.user` is populated.
 *
 * On success:  calls `next()` — the route handler proceeds as normal.
 * On failure:  responds immediately with HTTP 402 and code `PREMIUM_REQUIRED`.
 *              The client should display an upsell screen on this code.
 *
 * Example usage:
 *   router.get('/weekly-plan', authenticate, requireAccess(FEATURES.TRAINING_PLAN), handler)
 *   router.post('/diagnosis',  authenticate, requireAccess(FEATURES.DIAGNOSIS),     handler)
 *
 * @param feature - The FEATURES enum value to check access for.
 * @returns       Express middleware function.
 */
export function requireAccess(feature: FEATURES) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      // requireAccess must always sit after authenticate; this is a wiring error
      sendError(res, 'Not authenticated.', ERROR_CODES.UNAUTHORIZED, 401);
      return;
    }

    try {
      const allowed = await hasAccess(userId, feature, req.user?.role);

      if (!allowed) {
        logger.info('Feature access denied', {
          userId,
          feature,
          role: req.user?.role,
          subscriptionPlan: req.user?.subscriptionPlan,
          path: req.path,
        });
        sendError(
          res,
          'This feature requires a premium subscription.',
          ERROR_CODES.PREMIUM_REQUIRED,
          402,
        );
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
