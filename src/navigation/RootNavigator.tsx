import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import type { RootStackParamList } from './types';
import AuthNavigator from './AuthNavigator';
import AthleteNavigator from './AthleteNavigator';
import CoachNavigator from './CoachNavigator';
import ParentNavigator from './ParentNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isAuthenticated, user, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const getInitialRoute = (): keyof RootStackParamList => {
    if (!isAuthenticated) return 'Auth';
    if (user?.role === 'coach') return 'CoachTabs';
    if (user?.role === 'parent') return 'ParentTabs';
    return 'AthleteTabs';
  };

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={getInitialRoute()}
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="AthleteTabs" component={AthleteNavigator} />
      <Stack.Screen name="CoachTabs" component={CoachNavigator} />
      <Stack.Screen name="ParentTabs" component={ParentNavigator} />
    </Stack.Navigator>
  );
}
