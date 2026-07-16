import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import * as Sentry from '@sentry/react-native';
import RootNavigator from '@/navigation/RootNavigator';
import ErrorBoundary from '@/components/ErrorBoundary';

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

function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
        <NavigationContainer
          onUnhandledAction={(action) => {
            Sentry.captureMessage(`Unhandled navigation action: ${action.type}`);
          }}
        >
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export default Sentry.wrap(App);
