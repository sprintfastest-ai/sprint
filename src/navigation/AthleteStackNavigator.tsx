import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AthleteStackParamList } from './types';
import AthleteNavigator from './AthleteNavigator';
import DiagnosisQuizScreen from '@/screens/athlete/DiagnosisQuizScreen';
import DiagnosisResultsScreen from '@/screens/athlete/DiagnosisResultsScreen';
import AchievementsScreen from '@/screens/athlete/AchievementsScreen';
import PaywallScreen from '@/screens/athlete/PaywallScreen';

const Stack = createNativeStackNavigator<AthleteStackParamList>();

export default function AthleteStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AthleteNavigator} />
      <Stack.Screen name="DiagnosisQuiz" component={DiagnosisQuizScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="DiagnosisResults" component={DiagnosisResultsScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
