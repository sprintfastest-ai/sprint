import React, { useEffect, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { setOnSignOut } from '@/api/client';
import type { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import AthleteStackNavigator from './AthleteStackNavigator';
import CoachStackNavigator from './CoachStackNavigator';
import ParentStackNavigator from './ParentStackNavigator';
import OnboardingScreen from '@/screens/athlete/OnboardingScreen';
import LoadingSpinner from '@/components/LoadingSpinner';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, isLoading, user, restoreSession, logout } =
    useAuthStore();

  // Register the forced sign-out hook once so the Axios interceptor can clear
  // state and navigate back to login when the refresh token expires.
  const handleForcedSignOut = useCallback(() => {
    logout().catch(() => undefined);
  }, [logout]);

  useEffect(() => {
    setOnSignOut(handleForcedSignOut);
  }, [handleForcedSignOut]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Show a full-screen spinner while we determine auth state on cold start.
  // This prevents a flash of the login screen for users with a valid session.
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!isAuthenticated) return 'Auth';
    if (user?.role === 'coach') return 'CoachTabs';
    if (user?.role === 'parent') return 'ParentTabs';
    if (user?.role === 'athlete' && user.onboardingCompleted === false) return 'Onboarding';
    return 'AthleteTabs';
  };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRoute()}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="AthleteTabs" component={AthleteStackNavigator} />
      <Stack.Screen name="CoachTabs" component={CoachStackNavigator} />
      <Stack.Screen name="ParentTabs" component={ParentStackNavigator} />
    </Stack.Navigator>
  );
}
