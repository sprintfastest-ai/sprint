import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ParentStackParamList } from './types';
import ParentNavigator from './ParentNavigator';
import ParentAthleteDetailScreen from '@/screens/parent/ParentAthleteDetailScreen';

const Stack = createNativeStackNavigator<ParentStackParamList>();

export default function ParentStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={ParentNavigator} />
      <Stack.Screen name="AthleteDetail" component={ParentAthleteDetailScreen} />
    </Stack.Navigator>
  );
}
