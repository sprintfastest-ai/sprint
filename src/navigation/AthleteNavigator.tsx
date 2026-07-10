import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
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

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Dashboard: { active: 'home',          inactive: 'home-outline' },
  Training:  { active: 'barbell',       inactive: 'barbell-outline' },
  Progress:  { active: 'bar-chart',     inactive: 'bar-chart-outline' },
  Chat:      { active: 'chatbubbles',   inactive: 'chatbubbles-outline' },
  Profile:   { active: 'person-circle', inactive: 'person-circle-outline' },
};

export default function AthleteNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => {
          const icons = TAB_ICONS[route.name];
          const name = icons ? (focused ? icons.active : icons.inactive) : 'ellipse';
          return <Ionicons name={name} size={24} color={color} />;
        },
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
