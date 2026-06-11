export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.sprintfastest.com/v1';

export const WEBSOCKET_URL =
  process.env.EXPO_PUBLIC_WEBSOCKET_URL ?? 'wss://ws.sprintfastest.com';

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

export const AGE_GROUPS = ['U11', 'U13', 'U15', 'U17', 'U20'] as const;
export type AgeGroup = (typeof AGE_GROUPS)[number];

export const DISTANCES = [20, 30, 60, 100, 200] as const;
export type Distance = (typeof DISTANCES)[number];

export const WEAKNESS_TYPES = [
  'acceleration',
  'top_speed',
  'speed_endurance',
] as const;
export type WeaknessType = (typeof WEAKNESS_TYPES)[number];
