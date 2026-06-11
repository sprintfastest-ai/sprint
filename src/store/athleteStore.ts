import { create } from 'zustand';
import { trainingApi } from '@/api/training';
import type {
  AthleteProfile,
  TrainingPlan,
  Session,
  PersonalBest,
  Achievement,
} from '@/types';

interface AthleteState {
  profile: AthleteProfile | null;
  currentPlan: TrainingPlan | null;
  sessions: Session[];
  personalBests: PersonalBest[];
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  fetchWeeklyPlan: (athleteId: string, weekStartDate: string) => Promise<void>;
  fetchPersonalBests: (athleteId: string) => Promise<void>;
  fetchSessionHistory: (athleteId: string) => Promise<void>;
  setProfile: (profile: AthleteProfile) => void;
  clearError: () => void;
}

export const useAthleteStore = create<AthleteState>((set) => ({
  profile: null,
  currentPlan: null,
  sessions: [],
  personalBests: [],
  achievements: [],
  isLoading: false,
  error: null,

  fetchWeeklyPlan: async (athleteId, weekStartDate) => {
    set({ isLoading: true, error: null });
    try {
      const plan = await trainingApi.getWeeklyPlan(athleteId, weekStartDate);
      set({ currentPlan: plan });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch plan' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPersonalBests: async (athleteId) => {
    set({ isLoading: true, error: null });
    try {
      const pbs = await trainingApi.getPersonalBests(athleteId);
      set({ personalBests: pbs });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch PBs' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSessionHistory: async (athleteId) => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await trainingApi.getSessionHistory(athleteId);
      set({ sessions });
    } catch (err) {
      set({
        error:
          err instanceof Error ? err.message : 'Failed to fetch sessions',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  setProfile: (profile) => set({ profile }),
  clearError: () => set({ error: null }),
}));
