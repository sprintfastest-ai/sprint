// ─── Domain types (mirrored from mobile) ────────────────────────────────────

export type UserRole = 'athlete' | 'parent' | 'coach' | 'admin';
export type WeaknessType = 'acceleration' | 'top_speed' | 'speed_endurance';
export type SubscriptionPlan = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';
export type ChatRole = 'user' | 'assistant';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AthleteProfile {
  userId: string;
  ageGroup: string;
  events: string[];
  trainingDaysPerWeek: number;
  nextRaceDate: string | null;
  weaknessType: WeaknessType | null;
}

export interface ParentProfile {
  userId: string;
  linkedAthleteIds: string[];
}

export interface CoachProfile {
  userId: string;
  clubName: string;
  linkedAthleteIds: string[];
}

export interface Drill {
  name: string;
  sets: number;
  reps: number;
  distance: number;
  restSeconds: number;
  cue: string;
}

export interface TrainingDay {
  dayNumber: number;
  sessionType: string;
  drills: Drill[];
  coachingCues: string[];
}

export interface TrainingPlan {
  id: string;
  athleteId: string;
  weekStartDate: string;
  days: TrainingDay[];
  isCoachOverride: boolean;
  isTaperWeek?: boolean;
  coachId?: string;
  createdAt: Date;
}

export interface PersonalBest {
  athleteId: string;
  distance: number;
  timeSeconds: number;
  recordedAt: string;
}

export interface Session {
  id: string;
  athleteId: string;
  planId: string;
  completedAt: string;
  timesRecorded: PersonalBest[];
}

export interface Diagnosis {
  athleteId: string;
  weaknessType: WeaknessType;
  drillPrescription: Drill[];
  diagnosedAt: string;
  previousDiagnosisId?: string;
}

export interface Achievement {
  id: string;
  athleteId: string;
  badgeType: string;
  unlockedAt: string;
}

export interface Subscription {
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  expiresAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: ChatRole;
  content: string;
  timestamp: string;
}

export interface CoachNote {
  coachId: string;
  athleteId: string;
  content: string;
  isVisibleToAthlete: boolean;
  createdAt: string;
}

// ─── API types ────────────────────────────────────────────────────────────────

export interface ApiMeta {
  page?: number;
  total?: number;
  version?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  error: null;
  meta?: ApiMeta;
}

export interface ApiErrorResponse {
  success: false;
  data: null;
  error: string;
  code: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Auth types ───────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  isVerified: boolean;
  athleteId?: string; // included when role === 'athlete' to avoid extra DB lookup
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: UserRole;
    isVerified: boolean;
    createdAt: Date;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterProfileData {
  // Athlete
  ageGroup?: string;
  primaryEvent?: string;
  trainingDaysPerWeek?: number;
  // Coach
  clubName?: string;
  bio?: string;
}

// ─── Request augmentation ────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
