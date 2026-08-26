export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.sprintfastest.com/v1';

export const WEBSOCKET_URL =
  process.env.EXPO_PUBLIC_WEBSOCKET_URL ?? 'wss://sprintfastest-api.onrender.com/ws';

export const enum FEATURES {
  TRAINING_PLAN = 'training_plan',
  DIAGNOSIS = 'diagnosis',
  CHAT_COACH = 'chat_coach',
  AUDIO_COACHING = 'audio_coaching',
  LEADERBOARD = 'leaderboard',
  PARENT_DASHBOARD = 'parent_dashboard',
  COACH_DASHBOARD = 'coach_dashboard',
  RACE_TAPER = 'race_taper',
  RE_DIAGNOSIS = 're_diagnosis',
}

// Masters spans a wide age range, so it's picked in two steps in the UI:
// "Masters" first, then a specific V-tier. The literal string "Masters" is
// never stored or sent to the API — only the resolved tier (e.g. 'V45') —
// so it's not in AGE_GROUPS, only in AGE_GROUP_PRIMARY_OPTIONS (what the
// first-step picker renders). Keep in sync with backend/src/utils/constants.ts.
export const MASTERS_TIERS = [
  'V35', 'V40', 'V45', 'V50', 'V55', 'V60', 'V65', 'V70', 'V75', 'V80', 'V85', 'V90', 'V95', 'V100+',
] as const;
export const AGE_GROUP_PRIMARY_OPTIONS = ['U10', 'U12', 'U14', 'U16', 'U18', 'U20', 'Senior', 'Masters'] as const;
export const AGE_GROUPS = ['U10', 'U12', 'U14', 'U16', 'U18', 'U20', 'Senior', ...MASTERS_TIERS] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

/** True for any stored age-group value that's a Masters V-tier (e.g. 'V45'). */
export function isMastersTier(ageGroup: string | null | undefined): boolean {
  return !!ageGroup && (MASTERS_TIERS as readonly string[]).includes(ageGroup);
}

// Age groups that trigger the under-13 parental-consent gate — kept in
// sync with the same constant on the backend (auth.service.ts), which is
// the one that actually enforces it. U10 is obviously under 13; U12
// covers ages up to 12, which can still be under 13.
export const UNDER_13_AGE_GROUPS: readonly string[] = ['U10', 'U12'];

export const DISTANCES = [60, 75, 80, 100, 150, 200, 300, 400] as const;
export type Distance = (typeof DISTANCES)[number];

export const WEAKNESS_TYPES = [
  'acceleration',
  'top_speed',
  'speed_endurance',
] as const;
export type WeaknessType = (typeof WEAKNESS_TYPES)[number];
