export const API_PREFIX = '/api/v1';

export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  PARENT_CONSENT_REQUIRED: 'PARENT_CONSENT_REQUIRED',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  INVALID_VERIFICATION_TOKEN: 'INVALID_VERIFICATION_TOKEN',
  INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  // Input
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AI_ERROR: 'AI_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  // Subscriptions / feature access
  PREMIUM_REQUIRED: 'PREMIUM_REQUIRED',
  INVALID_WEBHOOK_SIGNATURE: 'INVALID_WEBHOOK_SIGNATURE',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// Masters is a UI-only grouping step on the frontend (pick "Masters", then
// a specific V-tier) — the literal string "Masters" is never stored or
// sent to the API, only the resolved tier (e.g. 'V45'), so it doesn't
// appear here. Keep in sync with src/utils/constants.ts on the frontend.
const MASTERS_TIERS = [
  'V35', 'V40', 'V45', 'V50', 'V55', 'V60', 'V65', 'V70', 'V75', 'V80', 'V85', 'V90', 'V95', 'V100+',
] as const;
export const AGE_GROUPS = ['U10', 'U12', 'U14', 'U16', 'U18', 'U20', 'Senior', ...MASTERS_TIERS] as const;

// Age groups that trigger the under-13 parental-consent gate (see
// auth.service.ts). U10 is obviously under 13; U12 covers ages up to 12,
// which can still be under 13.
export const UNDER_13_AGE_GROUPS: readonly string[] = ['U10', 'U12'];

export const DISTANCES = [60, 75, 80, 100, 150, 200, 300, 400] as const;
export const WEAKNESS_TYPES = [
  'acceleration',
  'top_speed',
  'speed_endurance',
] as const;

/**
 * Feature flag keys — used as the `feature` column value in feature_access
 * and as the argument to requireAccess() middleware.
 */
export enum FEATURES {
  TRAINING_PLAN      = 'training_plan',
  DIAGNOSIS          = 'diagnosis',
  CHAT_COACH         = 'chat_coach',
  AUDIO_COACHING     = 'audio_coaching',
  LEADERBOARD        = 'leaderboard',
  PARENT_DASHBOARD   = 'parent_dashboard',
  COACH_DASHBOARD    = 'coach_dashboard',
  RACE_TAPER         = 'race_taper',
  RE_DIAGNOSIS       = 're_diagnosis',
  PERFORMANCE_TRACKER = 'performance_tracker',
}

/**
 * Features that are available on the free tier.
 * These are never blocked by requireAccess() — they are noted here for
 * documentation and for the access.service.ts short-circuit.
 *
 * Enforcement of free-tier *limits* (e.g. 1 plan, 1 diagnosis) happens
 * inside the relevant service, not here.
 */
export const FREE_TIER_FEATURES: ReadonlySet<FEATURES> = new Set([
  FEATURES.TRAINING_PLAN,       // 1 week per rolling period — enforced at plan generation
  FEATURES.DIAGNOSIS,           // 1 diagnosis — enforced at diagnosis creation
  FEATURES.PERFORMANCE_TRACKER, // always free, no limit
]);
