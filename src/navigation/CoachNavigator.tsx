import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { CoachTabParamList } from './types';
import CoachAthletesScreen from '@/screens/coach/CoachAthletesScreen';
import CoachProfileScreen from '@/screens/coach/CoachProfileScreen';

const Tab = createBottomTabNavigator<CoachTabParamList>();

const COLORS = {
  primary: '#1A6BB5',
  grey: '#6B7280',
  surface: '#FFFFFF',
  border: '#E0E0E0',
};

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<string, { active: IoniconsName; inactive: IoniconsName }> = {
  Athletes: { active: 'people',        inactive: 'people-outline' },
  Profile:  { active: 'person-circle', inactive: 'person-circle-outline' },
};

export default function CoachNavigator() {
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
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Athletes" component={CoachAthletesScreen} />
      <Tab.Screen name="Profile" component={CoachProfileScreen} />
    </Tab.Navigator>
  );
}
