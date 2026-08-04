import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/api/client';
import { registerPushToken } from '@/api/notifications';
import { registerForPushNotificationsAsync } from './useNotifications';

/**
 * Requests notification permission and registers the device's Expo push
 * token with the backend whenever the user is authenticated. Safe to call
 * on every mount — it no-ops if the token hasn't changed since last time,
 * and silently skips if permission is denied or no token can be issued
 * (e.g. running in a simulator).
 */
export function usePushRegistration(isAuthenticated: boolean): void {
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    (async () => {
      const registration = await registerForPushNotificationsAsync();
      if (!registration || cancelled) return;

      const previousToken = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
      if (previousToken === registration.token) return;

      try {
        await registerPushToken(registration.token, registration.platform);
        await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, registration.token);
      } catch {
        // Best-effort — a session reminder is not critical enough to surface an error.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);
}
