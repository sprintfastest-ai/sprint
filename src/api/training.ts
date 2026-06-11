import client from './client';
import type { TrainingPlan, Session, PersonalBest } from '@/types';

export const trainingApi = {
  getWeeklyPlan: async (
    athleteId: string,
    weekStartDate: string,
  ): Promise<TrainingPlan> => {
    const { data } = await client.get<TrainingPlan>(
      `/athletes/${athleteId}/plans`,
      { params: { weekStartDate } },
    );
    return data;
  },

  completeSession: async (
    athleteId: string,
    planId: string,
    timesRecorded: PersonalBest[],
  ): Promise<Session> => {
    const { data } = await client.post<Session>(
      `/athletes/${athleteId}/sessions`,
      { planId, timesRecorded },
    );
    return data;
  },

  getSessionHistory: async (athleteId: string): Promise<Session[]> => {
    const { data } = await client.get<Session[]>(
      `/athletes/${athleteId}/sessions`,
    );
    return data;
  },

  getPersonalBests: async (athleteId: string): Promise<PersonalBest[]> => {
    const { data } = await client.get<PersonalBest[]>(
      `/athletes/${athleteId}/pbs`,
    );
    return data;
  },
};
