import { useCallback } from 'react';
import { useAthleteStore } from '@/store/athleteStore';
import { useAuth } from './useAuth';

export function useTraining() {
  const { user } = useAuth();
  const {
    currentPlan,
    sessions,
    personalBests,
    isLoading,
    error,
    fetchWeeklyPlan,
    fetchPersonalBests,
    fetchSessionHistory,
  } = useAthleteStore();

  const loadWeeklyPlan = useCallback(
    (weekStartDate: string) => {
      if (user?.id) fetchWeeklyPlan(user.id, weekStartDate);
    },
    [user?.id, fetchWeeklyPlan],
  );

  const loadPersonalBests = useCallback(() => {
    if (user?.id) fetchPersonalBests(user.id);
  }, [user?.id, fetchPersonalBests]);

  return {
    currentPlan,
    sessions,
    personalBests,
    isLoading,
    error,
    loadWeeklyPlan,
    loadPersonalBests,
    fetchSessionHistory,
  };
}
