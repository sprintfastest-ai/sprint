import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/api/auth';
import { STORAGE_KEYS } from '@/api/client';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    role: User['role'],
  ) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.login({ email, password });
      set({ user, isAuthenticated: true });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Login failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await authApi.register({ email, password, role });
      set({ user, isAuthenticated: true });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Registration failed',
      });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const user = await authApi.me();
      set({ user, isAuthenticated: true });
    } catch {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
