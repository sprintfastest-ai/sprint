import { create } from 'zustand';
import { coachApi } from '@/api/coach';
import type { CoachProfile, CoachNote } from '@/types';

interface CoachState {
  profile: CoachProfile | null;
  notes: CoachNote[];
  isLoading: boolean;
  error: string | null;
  fetchNotes: (coachId: string, athleteId: string) => Promise<void>;
  addNote: (note: Omit<CoachNote, 'createdAt'>) => Promise<void>;
  setProfile: (profile: CoachProfile) => void;
  clearError: () => void;
}

export const useCoachStore = create<CoachState>((set) => ({
  profile: null,
  notes: [],
  isLoading: false,
  error: null,

  fetchNotes: async (coachId, athleteId) => {
    set({ isLoading: true, error: null });
    try {
      const notes = await coachApi.getNotes(coachId, athleteId);
      set({ notes });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch notes',
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addNote: async (note) => {
    set({ isLoading: true, error: null });
    try {
      const created = await coachApi.addNote(note);
      set((state) => ({ notes: [created, ...state.notes] }));
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to add note',
      });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  setProfile: (profile) => set({ profile }),
  clearError: () => set({ error: null }),
}));
