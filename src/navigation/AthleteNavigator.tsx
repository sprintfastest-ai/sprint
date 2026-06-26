import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { AthleteTabParamList } from './types';
import AthleteDashboardScreen from '@/screens/athlete/AthleteDashboardScreen';
import TrainingScreen from '@/screens/athlete/TrainingScreen';
import ProgressScreen from '@/screens/athlete/ProgressScreen';
import ChatScreen from '@/screens/athlete/ChatScreen';
import AthleteProfileScreen from '@/screens/athlete/AthleteProfileScreen';

const Tab = createBottomTabNavigator<AthleteTabParamList>();

const COLORS = {
  primary: '#1A6BB5',
  grey: '#6B7280',
  surface: '#FFFFFF',
  border: '#E0E0E0',
};

function TabIcon({ type, color }: { type: string; color: string }) {
  const icons: Record<string, string> = {
    Dashboard: '⌂',
    Training:  '📅',
    Progress:  '📊',
    Chat:      '💬',
    Profile:   '👤',
  };
  return <Text style={{ fontSize: 22, color }}>{icons[type] ?? '●'}</Text>;
}

export default function AthleteNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => <TabIcon type={route.name} color={color} />,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.grey,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={AthleteDashboardScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Training"  component={TrainingScreen} />
      <Tab.Screen name="Progress"  component={ProgressScreen} />
      <Tab.Screen name="Chat"      component={ChatScreen} />
      <Tab.Screen name="Profile"   component={AthleteProfileScreen} />
    </Tab.Navigator>
  );
}
