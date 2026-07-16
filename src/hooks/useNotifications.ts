import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
