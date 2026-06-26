import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      user: state.user,
      accessToken: state.accessToken,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      register: state.register,
      logout: state.logout,
      clearError: state.clearError,
    })),
  );
}
