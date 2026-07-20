import client from './client';
import type { Session, PersonalBest, Diagnosis } from '@/types';

type ApiResponse<T> = { data: T };

export interface ParentLinkedAthlete {
  athleteId: string;
  userId: string;
  email: string;
  ageGroup: string | null;
  primaryEvent: string | null;
  streakCount: number;
  lastSessionDate: string | null;
  nextRaceDate: string | null;
}

export interface AthleteProgress {
  sessions: Session[];
  personalBests: PersonalBest[];
  diagnoses: Diagnosis[];
}

export const parentApi = {
  getLinkedAthletes: async (): Promise<ParentLinkedAthlete[]> => {
    const { data } = await client.get<ApiResponse<ParentLinkedAthlete[]>>('/parents/athletes');
    return data.data;
  },

  getAthleteProgress: async (athleteId: string): Promise<AthleteProgress> => {
    const { data } = await client.get<ApiResponse<AthleteProgress>>(`/parents/athletes/${athleteId}/progress`);
    return data.data;
  },
};
