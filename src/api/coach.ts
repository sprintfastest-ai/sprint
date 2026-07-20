import client from './client';
import type { TrainingDay } from '@/types';

type ApiResponse<T> = { data: T };

export interface CoachProfile {
  coachId: string;
  clubName: string | null;
  bio: string | null;
}

export interface CoachLinkedAthlete {
  athleteId: string;
  userId: string;
  email: string;
  ageGroup: string | null;
  primaryEvent: string | null;
  weaknessType: string | null;
  streakCount: number;
}

export interface CoachNote {
  id: string;
  athleteId: string;
  content: string;
  isVisibleToAthlete: boolean;
  createdAt: string;
}

export const coachApi = {
  getMyProfile: async (): Promise<CoachProfile> => {
    const { data } = await client.get<ApiResponse<CoachProfile>>('/coaches/me');
    return data.data;
  },

  updateMyProfile: async (updates: { clubName?: string; bio?: string }): Promise<CoachProfile> => {
    const { data } = await client.patch<ApiResponse<CoachProfile>>('/coaches/me', updates);
    return data.data;
  },

  getLinkedAthletes: async (coachUserId: string): Promise<CoachLinkedAthlete[]> => {
    const { data } = await client.get<ApiResponse<CoachLinkedAthlete[]>>(`/coaches/${coachUserId}/athletes`);
    return data.data;
  },

  getNotes: async (coachUserId: string, athleteId: string): Promise<CoachNote[]> => {
    const { data } = await client.get<ApiResponse<CoachNote[]>>(`/coaches/${coachUserId}/athletes/${athleteId}/notes`);
    return data.data;
  },

  addNote: async (athleteId: string, content: string, isVisibleToAthlete: boolean): Promise<CoachNote> => {
    const { data } = await client.post<ApiResponse<CoachNote>>('/coaches/notes', {
      athleteId,
      content,
      isVisibleToAthlete,
    });
    return data.data;
  },

  overridePlan: async (athleteId: string, weekStartDate: string, days: TrainingDay[]) => {
    const { data } = await client.put(`/coaches/athletes/${athleteId}/plans/override`, {
      weekStartDate,
      days,
    });
    return data;
  },
};
