import pool from '../pool';

export interface SubscriptionRow {
  id: string;
  user_id: string;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'trialing';
  revenue_cat_id: string | null;
  stripe_customer_id: string | null;
  current_period_start: Date | null;
  current_period_end: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface FeatureAccessRow {
  id: string;
  user_id: string;
  feature: string;
  granted_at: Date;
  expires_at: Date | null;
  granted_by: string;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export async function getSubscription(userId: string): Promise<SubscriptionRow | null> {
  const { rows } = await pool.query<SubscriptionRow>(
    'SELECT * FROM subscriptions WHERE user_id = $1 LIMIT 1',
    [userId],
  );
  return rows[0] ?? null;
}

export async function upsertSubscription(
  userId: string,
  fields: Partial<Omit<SubscriptionRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
): Promise<SubscriptionRow> {
  const { rows } = await pool.query<SubscriptionRow>(
    `INSERT INTO subscriptions (user_id, plan, status, revenue_cat_id, stripe_customer_id,
       current_period_start, current_period_end)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (user_id)
     DO UPDATE SET
       plan                  = EXCLUDED.plan,
       status                = EXCLUDED.status,
       revenue_cat_id        = COALESCE(EXCLUDED.revenue_cat_id, subscriptions.revenue_cat_id),
       stripe_customer_id    = COALESCE(EXCLUDED.stripe_customer_id, subscriptions.stripe_customer_id),
       current_period_start  = EXCLUDED.current_period_start,
       current_period_end    = EXCLUDED.current_period_end,
       updated_at            = NOW()
     RETURNING *`,
    [
      userId,
      fields.plan ?? 'free',
      fields.status ?? 'active',
      fields.revenue_cat_id ?? null,
      fields.stripe_customer_id ?? null,
      fields.current_period_start ?? null,
      fields.current_period_end ?? null,
    ],
  );
  return rows[0] as SubscriptionRow;
}

export async function expireSubscriptions(): Promise<number> {
  const { rowCount } = await pool.query(
    `UPDATE subscriptions
     SET status = 'expired', updated_at = NOW()
     WHERE status IN ('active','trialing')
       AND current_period_end IS NOT NULL
       AND current_period_end < NOW()`,
  );
  return rowCount ?? 0;
}

export async function isPremium(userId: string): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM subscriptions
     WHERE user_id = $1 AND plan = 'premium' AND status IN ('active','trialing')
     LIMIT 1`,
    [userId],
  );
  return rows.length > 0;
}

// ─── Feature Access ──────────────────────────────────────────────────────────

export async function hasFeatureAccess(
  userId: string,
  feature: string,
): Promise<boolean> {
  const { rows } = await pool.query(
    `SELECT 1 FROM feature_access
     WHERE user_id = $1
       AND feature = $2
       AND (expires_at IS NULL OR expires_at > NOW())
     LIMIT 1`,
    [userId, feature],
  );
  return rows.length > 0;
}

export async function grantFeatureAccess(
  userId: string,
  feature: string,
  grantedBy = 'subscription',
  expiresAt?: Date,
): Promise<FeatureAccessRow> {
  const { rows } = await pool.query<FeatureAccessRow>(
    `INSERT INTO feature_access (user_id, feature, granted_by, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, feature)
     DO UPDATE SET
       granted_by = EXCLUDED.granted_by,
       granted_at = NOW(),
       expires_at = EXCLUDED.expires_at
     RETURNING *`,
    [userId, feature, grantedBy, expiresAt ?? null],
  );
  return rows[0] as FeatureAccessRow;
}

export async function revokeFeatureAccess(
  userId: string,
  feature: string,
): Promise<void> {
  await pool.query(
    'DELETE FROM feature_access WHERE user_id = $1 AND feature = $2',
    [userId, feature],
  );
}

export async function getUserFeatures(userId: string): Promise<string[]> {
  const { rows } = await pool.query<{ feature: string }>(
    `SELECT feature FROM feature_access
     WHERE user_id = $1
       AND (expires_at IS NULL OR expires_at > NOW())`,
    [userId],
  );
  return rows.map((r) => r.feature);
}

export async function grantAllPremiumFeatures(userId: string): Promise<void> {
  const features = [
    'training_plan', 'diagnosis', 'chat_coach', 'audio_coaching',
    'leaderboard', 'parent_dashboard', 'coach_dashboard',
    'race_taper', 're_diagnosis',
  ];
  await pool.query(
    `INSERT INTO feature_access (user_id, feature, granted_by)
     SELECT $1, UNNEST($2::TEXT[]), 'subscription'
     ON CONFLICT (user_id, feature) DO UPDATE SET granted_at = NOW(), expires_at = NULL`,
    [userId, features],
  );
}

export async function revokeAllPremiumFeatures(userId: string): Promise<void> {
  await pool.query(
    `DELETE FROM feature_access WHERE user_id = $1 AND granted_by = 'subscription'`,
    [userId],
  );
}
