import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { AthleteTabParamList } from './types';
import AthleteDashboardScreen from '@/screens/athlete/AthleteDashboardScreen';
import TrainingScreen from '@/screens/athlete/TrainingScreen';
import ProgressScreen from '@/screens/athlete/ProgressScreen';
import ChatScreen from '@/screens/athlete/ChatScreen';
import AthleteProfileScreen from '@/screens/athlete/AthleteProfileScreen';

const Tab = createBottomTabNavigator<AthleteTabParamList>();

export default function AthleteNavigator() {
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
      <Tab.Screen name="Dashboard" component={AthleteDashboardScreen} />
      <Tab.Screen name="Training" component={TrainingScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={AthleteProfileScreen} />
    </Tab.Navigator>
  );
}
