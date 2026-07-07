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

  const athleteId = user?.athleteId ?? user?.id ?? '';

  const loadWeeklyPlan = useCallback(
    (weekStartDate: string) => {
      if (athleteId) fetchWeeklyPlan(athleteId, weekStartDate);
    },
    [athleteId, fetchWeeklyPlan],
  );

  const loadPersonalBests = useCallback(() => {
    if (athleteId) fetchPersonalBests(athleteId);
  }, [athleteId, fetchPersonalBests]);

  const loadSessionHistory = useCallback(() => {
    if (athleteId) fetchSessionHistory(athleteId);
  }, [athleteId, fetchSessionHistory]);

  return {
    currentPlan,
    sessions,
    personalBests,
    isLoading,
    error,
    loadWeeklyPlan,
    loadPersonalBests,
    loadSessionHistory,
  };
}
