import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CoachStackParamList } from './types';
import CoachNavigator from './CoachNavigator';
import CoachAthleteDetailScreen from '@/screens/coach/CoachAthleteDetailScreen';

const Stack = createNativeStackNavigator<CoachStackParamList>();

export default function CoachStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={CoachNavigator} />
      <Stack.Screen name="AthleteDetail" component={CoachAthleteDetailScreen} />
    </Stack.Navigator>
  );
}
