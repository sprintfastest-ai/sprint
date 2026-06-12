import {
  getSubscription,
  hasFeatureAccess,
  grantFeatureAccess as dbGrantFeatureAccess,
  revokeFeatureAccess,
  getUserFeatures,
  grantAllPremiumFeatures,
  revokeAllPremiumFeatures,
  upsertSubscription,
  type SubscriptionRow,
} from '@/db/queries/subscriptions';
import { AppError } from '@/middleware/errorHandler';
import { FEATURES, FREE_TIER_FEATURES, ERROR_CODES } from '@/utils/constants';
import logger from '@/utils/logger';

// ─── Feature access check ─────────────────────────────────────────────────────

/**
 * The single source of truth for all premium feature gating.
 *
 * Resolution order:
 *   1. Free-tier features — always returns true, regardless of subscription.
 *   2. COACH_DASHBOARD — always granted to any user with role 'coach';
 *      callers should pass `userRole` when available to skip the DB hit.
 *   3. Premium subscription — active/trialing premium plan grants all features.
 *   4. Explicit feature_access row — individual override grant (e.g. admin gift,
 *      coach free access). Checked last so it also covers non-premium users.
 *
 * @param userId       - The `users.id` of the requesting user.
 * @param feature      - The FEATURES enum value to check.
 * @param userRole     - Optional role string from the JWT; used to short-circuit
 *                       the COACH_DASHBOARD check without a DB query.
 * @returns            `true` if the user may use the feature, `false` otherwise.
 */
export async function hasAccess(
  userId: string,
  feature: FEATURES,
  userRole?: string,
): Promise<boolean> {
  // 1. Free-tier features are always accessible
  if (FREE_TIER_FEATURES.has(feature)) {
    return true;
  }

  // 2. Coaches always have access to their own dashboard
  if (feature === FEATURES.COACH_DASHBOARD && userRole === 'coach') {
    return true;
  }

  // Run subscription and feature_access checks in parallel to minimise latency
  const [subscription, specificGrant] = await Promise.all([
    getSubscription(userId),
    hasFeatureAccess(userId, feature),
  ]);

  // 3. Active/trialing premium subscription unlocks everything
  if (
    subscription?.plan === 'premium' &&
    (subscription.status === 'active' || subscription.status === 'trialing')
  ) {
    return true;
  }

  // 4. Explicit per-feature grant (admin override, coach gift, etc.)
  return specificGrant;
}

/**
 * Returns all feature keys currently accessible to a user, combining
 * subscription-level access with individual grants.
 *
 * Used by the mobile app on startup to build the local feature flag map
 * so it can hide/show UI without an API call per feature.
 *
 * @param userId   - The `users.id` to resolve features for.
 * @param userRole - Optional role string from JWT (avoids one DB call for coaches).
 * @returns        Array of FEATURES string values the user may access.
 */
export async function getAllAccessibleFeatures(
  userId: string,
  userRole?: string,
): Promise<string[]> {
  const subscription = await getSubscription(userId);
  const isPremiumActive =
    subscription?.plan === 'premium' &&
    (subscription.status === 'active' || subscription.status === 'trialing');

  if (isPremiumActive) {
    // Premium users get all features
    return Object.values(FEATURES);
  }

  // Start with free tier
  const granted = new Set<string>(FREE_TIER_FEATURES);

  // Coaches always get their dashboard
  if (userRole === 'coach') {
    granted.add(FEATURES.COACH_DASHBOARD);
  }

  // Add any individual grants from feature_access table
  const individualGrants = await getUserFeatures(userId);
  individualGrants.forEach((f) => granted.add(f));

  return Array.from(granted);
}

// ─── Admin / one-time grant ───────────────────────────────────────────────────

/**
 * Grants a specific feature to a user, optionally with an expiry.
 *
 * Use this for:
 *   - Gifting a coach free COACH_DASHBOARD access
 *   - Admin-granting a trial feature to a specific user
 *   - Promotional access windows
 *
 * Calls are idempotent — if a grant already exists it is updated in place
 * (see subscriptions query layer: ON CONFLICT DO UPDATE).
 *
 * @param userId    - Target user's `users.id`.
 * @param feature   - The FEATURES enum value to grant.
 * @param grantedBy - Source tag stored in the DB (e.g. 'admin', 'promo', 'coach_default').
 * @param expiresAt - Optional expiry date; omit for a permanent grant.
 * @returns         The created/updated feature_access row.
 */
export async function grantFeatureAccess(
  userId: string,
  feature: FEATURES,
  grantedBy = 'admin',
  expiresAt?: Date,
) {
  const row = await dbGrantFeatureAccess(userId, feature, grantedBy, expiresAt);
  logger.info('Feature access granted', { userId, feature, grantedBy, expiresAt });
  return row;
}

/**
 * Revokes a specific feature grant for a user.
 *
 * This does NOT affect subscription-level access — if the user has a premium
 * subscription they will still have access via that path. Use this only to
 * remove an explicit row created by `grantFeatureAccess`.
 *
 * @param userId  - Target user's `users.id`.
 * @param feature - The FEATURES enum value to revoke.
 */
export async function revokeFeatureAccessForUser(
  userId: string,
  feature: FEATURES,
): Promise<void> {
  await revokeFeatureAccess(userId, feature);
  logger.info('Feature access revoked', { userId, feature });
}

// ─── Subscription lifecycle ───────────────────────────────────────────────────

/**
 * Upgrades a user to premium and grants all premium features in feature_access.
 * Called by the RevenueCat webhook on INITIAL_PURCHASE and RENEWAL events.
 *
 * @param userId               - Target user's `users.id`.
 * @param revenueCatId         - RevenueCat subscriber ID for reconciliation.
 * @param currentPeriodStart   - Subscription period start timestamp.
 * @param currentPeriodEnd     - Subscription period end timestamp.
 * @returns                    The updated subscription row.
 */
export async function activatePremium(
  userId: string,
  revenueCatId: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
): Promise<SubscriptionRow> {
  const [subscription] = await Promise.all([
    upsertSubscription(userId, {
      plan: 'premium',
      status: 'active',
      revenue_cat_id: revenueCatId,
      current_period_start: currentPeriodStart,
      current_period_end: currentPeriodEnd,
    }),
    grantAllPremiumFeatures(userId),
  ]);

  logger.info('Premium subscription activated', {
    userId,
    revenueCatId,
    currentPeriodEnd,
  });

  return subscription;
}

/**
 * Marks a subscription as cancelled but keeps the user on premium until the
 * end of the current billing period. Called on RevenueCat CANCELLATION event.
 *
 * The user retains premium access until `currentPeriodEnd`, at which point
 * the scheduled expiry job (or the next EXPIRATION webhook) will downgrade them.
 *
 * @param userId         - Target user's `users.id`.
 * @param revenueCatId   - RevenueCat subscriber ID.
 * @param periodEnd      - When the final paid period ends.
 * @returns              The updated subscription row.
 */
export async function cancelPremium(
  userId: string,
  revenueCatId: string,
  periodEnd: Date,
): Promise<SubscriptionRow> {
  const subscription = await upsertSubscription(userId, {
    plan: 'premium',   // Keep premium until period end
    status: 'cancelled',
    revenue_cat_id: revenueCatId,
    current_period_end: periodEnd,
  });

  logger.info('Premium subscription cancelled — access retained until period end', {
    userId,
    revenueCatId,
    periodEnd,
  });

  return subscription;
}

/**
 * Expires a user's subscription and removes all subscription-granted features.
 * Called on RevenueCat EXPIRATION event, or by the nightly cron job.
 *
 * @param userId       - Target user's `users.id`.
 * @param revenueCatId - RevenueCat subscriber ID (used for logging/reconciliation).
 * @returns            The updated subscription row.
 */
export async function expirePremium(
  userId: string,
  revenueCatId: string,
): Promise<SubscriptionRow> {
  const [subscription] = await Promise.all([
    upsertSubscription(userId, {
      plan: 'free',
      status: 'expired',
      revenue_cat_id: revenueCatId,
    }),
    revokeAllPremiumFeatures(userId),
  ]);

  logger.info('Premium subscription expired — downgraded to free', {
    userId,
    revenueCatId,
  });

  return subscription;
}

/**
 * Returns the current subscription row for a user, or a synthetic free/active
 * object if no row exists yet (e.g. newly registered users before the DB row
 * is created).
 *
 * @param userId - The `users.id` to look up.
 * @returns      The subscription row, or a default free-plan object.
 */
export async function getSubscriptionStatus(userId: string): Promise<SubscriptionRow> {
  const subscription = await getSubscription(userId);
  if (subscription) return subscription;

  // Synthesise a default — newly registered users always start on free/active
  return {
    id: '',
    user_id: userId,
    plan: 'free',
    status: 'active',
    revenue_cat_id: null,
    stripe_customer_id: null,
    current_period_start: null,
    current_period_end: null,
    created_at: new Date(),
    updated_at: new Date(),
  };
}
