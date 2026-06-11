import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { ParentTabParamList } from './types';
import ParentOverviewScreen from '@/screens/parent/ParentOverviewScreen';
import ParentProgressScreen from '@/screens/parent/ParentProgressScreen';
import ParentProfileScreen from '@/screens/parent/ParentProfileScreen';

const Tab = createBottomTabNavigator<ParentTabParamList>();

export default function ParentNavigator() {
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
      <Tab.Screen name="Overview" component={ParentOverviewScreen} />
      <Tab.Screen name="Progress" component={ParentProgressScreen} />
      <Tab.Screen name="Profile" component={ParentProfileScreen} />
    </Tab.Navigator>
  );
}
