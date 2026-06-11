import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  return useAuthStore((state) => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    login: state.login,
    register: state.register,
    logout: state.logout,
    clearError: state.clearError,
  }));
}
