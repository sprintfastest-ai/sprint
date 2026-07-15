import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as authApi from '@/api/auth.api';
import type { RegisterPayload } from '@/api/auth.api';
import { STORAGE_KEYS } from '@/api/client';
import type { User } from '@/types';

function parseAuthError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      return 'Server is waking up — please try again in a moment.';
    }
    const body = err.response?.data as { message?: string; error?: string } | undefined;
    const msg = body?.message ?? body?.error;
    if (msg) return msg;
    if (!err.response) return 'Cannot reach the server. Check your connection.';
  }
  return err instanceof Error ? err.message : 'Something went wrong. Please try again.';
}

// Re-export so callers can import the type from here if needed
export type { RegisterPayload };

interface AuthState {
  user: User | null;
  /** Raw JWT stored here for components that need it (e.g. WebSocket). */
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  /**
   * Called on app startup — reads tokens from AsyncStorage, calls /auth/me
   * to validate. The axios interceptor transparently refreshes the access
   * token if it has expired, so no manual refresh logic is needed here.
   */
  restoreSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, accessToken, refreshToken } = await authApi.login(
        email,
        password,
      );
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
      set({ user, accessToken, isAuthenticated: true });
    } catch (err) {
      set({ error: parseAuthError(err) });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const { user, accessToken, refreshToken } = await authApi.register(data);
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
      ]);
      set({ user, accessToken, isAuthenticated: true });
    } catch (err) {
      set({ error: parseAuthError(err) });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      // Best-effort server-side token revocation — don't block UI on failure
      await authApi.logout().catch(() => undefined);
    } finally {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (!storedToken) return;

      // /auth/me will 401 if expired; the axios interceptor will silently
      // refresh and retry, so we get a valid user back either way.
      const user = await authApi.me();
      // Re-read the (possibly refreshed) token from storage
      const currentToken = await AsyncStorage.getItem(
        STORAGE_KEYS.ACCESS_TOKEN,
      );
      set({ user, accessToken: currentToken, isAuthenticated: true });
    } catch {
      // Token invalid / refresh failed — start unauthenticated, clear any stale errors
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      set({ user: null, accessToken: null, isAuthenticated: false, error: null });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
