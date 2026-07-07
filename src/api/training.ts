import client from './client';
import type { TrainingPlan, Session, PersonalBest } from '@/types';

type ApiResponse<T> = { data: T };

export interface AthleteProfile {
  athleteId: string;
  ageGroup: string | null;
  primaryEvent: string | null;
  weaknessType: string | null;
  trainingDaysPerWeek: number | null;
  email?: string;
  role?: string;
}

export const profileApi = {
  getMyProfile: async (): Promise<AthleteProfile> => {
    const { data } = await client.get<ApiResponse<AthleteProfile>>('/athletes/me');
    return data.data;
  },
  updateMyProfile: async (updates: Partial<Pick<AthleteProfile, 'ageGroup' | 'primaryEvent' | 'trainingDaysPerWeek'>>): Promise<AthleteProfile> => {
    const { data } = await client.patch<ApiResponse<AthleteProfile>>('/athletes/me', updates);
    return data.data;
  },
};

export const trainingApi = {
  getWeeklyPlan: async (
    athleteId: string,
    weekStartDate: string,
  ): Promise<TrainingPlan> => {
    const { data } = await client.get<ApiResponse<TrainingPlan>>(
      `/athletes/${athleteId}/plans`,
      { params: { weekStartDate } },
    );
    return data.data;
  },

  completeSession: async (
    athleteId: string,
    planId: string,
    timesRecorded: PersonalBest[],
  ): Promise<Session> => {
    const { data } = await client.post<ApiResponse<Session>>(
      `/athletes/${athleteId}/sessions`,
      { planId, timesRecorded },
    );
    return data.data;
  },

  getSessionHistory: async (athleteId: string): Promise<Session[]> => {
    const { data } = await client.get<ApiResponse<Session[]>>(
      `/athletes/${athleteId}/sessions`,
    );
    return data.data;
  },

  getPersonalBests: async (athleteId: string): Promise<PersonalBest[]> => {
    const { data } = await client.get<ApiResponse<PersonalBest[]>>(
      `/athletes/${athleteId}/pbs`,
    );
    return data.data;
  },

  logPersonalBest: async (athleteId: string, distance: number, timeSeconds: number): Promise<PersonalBest[]> => {
    const { data } = await client.post<ApiResponse<PersonalBest[]>>(
      `/athletes/${athleteId}/pbs`,
      { distance, timeSeconds },
    );
    return data.data;
  },
};
