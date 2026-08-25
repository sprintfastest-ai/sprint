import React from 'react';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from '@/navigation/RootNavigator';
import type { RootStackParamList } from '@/navigation/types';

// There's no companion website at app.sprintfastest.com, so the
// password-reset email links straight into the app via this custom URL
// scheme (declared in app.json as "scheme": "sprintfastest") instead of an
// https:// link. Tapping sprintfastest://reset-password?token=<jwt> opens
// ResetPasswordScreen with `token` populated from the query string.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['sprintfastest://'],
  config: {
    screens: {
      Auth: {
        screens: {
          ResetPassword: 'reset-password',
        },
      },
    },
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
