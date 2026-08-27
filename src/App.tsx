import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import RootNavigator from '@/navigation/RootNavigator';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { RootStackParamList } from '@/navigation/types';

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

// Without a DSN this is a harmless no-op — every Sentry.* call below becomes
// a no-op too, so the app behaves identically until a DSN is configured.
Sentry.init({
  dsn: SENTRY_DSN,
  enabled: !!SENTRY_DSN,
  tracesSampleRate: 0.2,
  // Native crashes (the class of crash an ErrorBoundary can never catch)
  // are captured automatically by the native SDK once this runs.
});

// There's no companion website at app.sprintfastest.com, so the
// password-reset and email-verification emails link straight into the app
// via this custom URL scheme (declared in app.json as
// "scheme": "sprintfastest") instead of an https:// link. Tapping
// sprintfastest://reset-password?token=<jwt> or
// sprintfastest://verify-email?token=<jwt> opens the matching screen with
// `token` populated from the query string.
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['sprintfastest://'],
  config: {
    screens: {
      Auth: {
        screens: {
          ResetPassword: 'reset-password',
          VerifyEmail: 'verify-email',
        },
      },
    },
  },
};

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <NavigationContainer
            linking={linking}
            onUnhandledAction={(action) => {
              Sentry.captureMessage(`Unhandled navigation action: ${action.type}`);
            }}
          >
            <StatusBar style="light" />
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default Sentry.wrap(App);
