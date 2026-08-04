import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushRegistration {
  token: string;
  platform: 'ios' | 'android';
}

/**
 * Requests notification permission (if not already decided) and, once
 * granted, exchanges it for an Expo push token. Returns null on denial or
 * on devices/simulators that can't receive push (getExpoPushTokenAsync
 * throws in that case) — callers should treat that as "skip silently".
 */
export async function registerForPushNotificationsAsync(): Promise<PushRegistration | null> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!projectId) return null;

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    return { token, platform: Platform.OS === 'ios' ? 'ios' : 'android' };
  } catch {
    return null;
  }
}

export function useNotifications(
  onNotification?: (notification: Notifications.Notification) => void,
) {
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        onNotification?.(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        onNotification?.(response.notification);
      });

    return () => {
      // Modern expo-notifications exposes .remove() directly on the
      // subscription — the old Notifications.removeNotificationSubscription()
      // static was removed and no longer exists on this API.
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [onNotification]);

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  };

  return { requestPermissions };
}
