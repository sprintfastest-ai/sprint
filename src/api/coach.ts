import client from './client';
import type { CoachNote, TrainingPlan } from '@/types';

export const coachApi = {
  getLinkedAthletes: async (coachId: string) => {
    const { data } = await client.get(`/coaches/${coachId}/athletes`);
    return data;
  },

  overridePlan: async (
    athleteId: string,
    plan: Partial<TrainingPlan>,
  ): Promise<TrainingPlan> => {
    const { data } = await client.put<TrainingPlan>(
      `/athletes/${athleteId}/plans/override`,
      plan,
    );
    return data;
  },

  addNote: async (note: Omit<CoachNote, 'createdAt'>): Promise<CoachNote> => {
    const { data } = await client.post<CoachNote>('/coach/notes', note);
    return data;
  },

  getNotes: async (
    coachId: string,
    athleteId: string,
  ): Promise<CoachNote[]> => {
    const { data } = await client.get<CoachNote[]>(
      `/coaches/${coachId}/athletes/${athleteId}/notes`,
    );
    return data;
  },
};
