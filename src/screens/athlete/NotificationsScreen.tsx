import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getNotifications, markNotificationRead, markAllNotificationsRead, type AppNotification } from '@/api/notifications';
import { timeAgo } from '@/utils/formatters';
import type { AthleteStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<AthleteStackParamList, 'Notifications'>;

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
  blueLight: '#EBF5FB',
};

const ICON_BY_TYPE: Record<string, keyof typeof Ionicons.glyphMap> = {
  badge_unlocked: 'trophy',
  coach_note: 'document-text',
  session_reminder: 'time',
};

export default function NotificationsScreen() {
  const navigation = useNavigation<NavProp>();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { notifications: list } = await getNotifications();
      setNotifications(list);
    } catch {
      // Leave whatever's already on screen — a transient load failure
      // shouldn't blank out a list the user might already be reading.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const handlePress = useCallback(async (n: AppNotification) => {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      markNotificationRead(n.id).catch(() => undefined);
    }
    if (n.type === 'badge_unlocked') {
      navigation.navigate('Achievements');
    }
  }, [navigation]);

  const handleMarkAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
    markAllNotificationsRead().catch(() => undefined);
  }, []);

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllRead} accessibilityLabel="Mark all as read">
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 26 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(n) => n.id}
          contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="notifications-off-outline" size={40} color={COLORS.grey} />
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>Badge unlocks, coach notes, and session reminders will show up here.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.row, !item.isRead && styles.rowUnread]}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, !item.isRead && styles.iconWrapUnread]}>
                <Ionicons
                  name={ICON_BY_TYPE[item.type] ?? 'notifications-outline'}
                  size={18}
                  color={item.isRead ? COLORS.grey : COLORS.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, !item.isRead && styles.titleUnread]}>{item.title}</Text>
                <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
                <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
              </View>
              {!item.isRead && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  markAllText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },

  list: { paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rowUnread: { backgroundColor: COLORS.blueLight },
  iconWrap: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapUnread: { backgroundColor: '#fff' },
  title: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  titleUnread: { fontWeight: '700' },
  body: { fontSize: 13, color: COLORS.grey, marginTop: 2, lineHeight: 18 },
  time: { fontSize: 11, color: COLORS.grey, marginTop: 4 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.orange, marginTop: 6 },

  emptyContainer: { flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 15, fontWeight: '600', color: COLORS.text, marginTop: 4 },
  emptySubtext: { fontSize: 13, color: COLORS.grey, textAlign: 'center', lineHeight: 19 },
});
