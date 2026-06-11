import { create } from 'zustand';
import type { ParentProfile } from '@/types';

interface ParentState {
  profile: ParentProfile | null;
  selectedAthleteId: string | null;
  isLoading: boolean;
  error: string | null;
  setProfile: (profile: ParentProfile) => void;
  selectAthlete: (athleteId: string) => void;
  clearError: () => void;
}

export const useParentStore = create<ParentState>((set) => ({
  profile: null,
  selectedAthleteId: null,
  isLoading: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  selectAthlete: (athleteId) => set({ selectedAthleteId: athleteId }),
  clearError: () => set({ error: null }),
}));
