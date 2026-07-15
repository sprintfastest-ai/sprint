export interface User {
  id: string;
  email: string;
  role: 'athlete' | 'parent' | 'coach' | 'admin';
  createdAt: string;
  athleteId?: string;
  subscriptionPlan?: 'free' | 'premium';
  isVerified?: boolean;
  onboardingCompleted?: boolean;
}

export interface AthleteProfile {
  userId: string;
  ageGroup: string;
  events: string[];
  trainingDaysPerWeek: number;
  nextRaceDate: string | null;
  weaknessType: 'acceleration' | 'top_speed' | 'speed_endurance' | null;
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
  newBadges?: Achievement[];
}

export interface Diagnosis {
  id: string;
  athleteId: string;
  weaknessType: 'acceleration' | 'top_speed' | 'speed_endurance';
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
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  expiresAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
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
