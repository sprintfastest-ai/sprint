import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { CoachTabParamList } from './types';
import CoachAthletesScreen from '@/screens/coach/CoachAthletesScreen';
import CoachPlansScreen from '@/screens/coach/CoachPlansScreen';
import CoachNotesScreen from '@/screens/coach/CoachNotesScreen';
import CoachProfileScreen from '@/screens/coach/CoachProfileScreen';

const Tab = createBottomTabNavigator<CoachTabParamList>();

export default function CoachNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#ff6b35',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Athletes" component={CoachAthletesScreen} />
      <Tab.Screen name="Plans" component={CoachPlansScreen} />
      <Tab.Screen name="Notes" component={CoachNotesScreen} />
      <Tab.Screen name="Profile" component={CoachProfileScreen} />
    </Tab.Navigator>
  );
}
