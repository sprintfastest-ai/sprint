import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { achievementsApi } from '@/api/achievements';
import { useAuthStore } from '@/store/authStore';
import { BADGE_CATALOGUE } from '@/utils/badges';
import type { Achievement } from '@/types';
import type { AthleteStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<AthleteStackParamList, 'Achievements'>;

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
};

export default function AchievementsScreen() {
  const navigation = useNavigation<NavProp>();
  const user = useAuthStore((s) => s.user);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const athleteId = user?.athleteId ?? user?.id;
    if (!athleteId) return;
    setLoading(true);
    achievementsApi.getAchievements(athleteId)
      .then(setAchievements)
      .catch(() => setAchievements([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const unlockedTypes = new Set(achievements.map((a) => a.badgeType));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Achievements</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.progressText}>
            {unlockedTypes.size} of {BADGE_CATALOGUE.length} badges unlocked
          </Text>
          <View style={styles.grid}>
            {BADGE_CATALOGUE.map((badge) => {
              const unlocked = unlockedTypes.has(badge.type);
              return (
                <View key={badge.type} style={[styles.badgeCard, !unlocked && styles.badgeCardLocked]}>
                  <View style={[styles.iconCircle, unlocked ? styles.iconCircleUnlocked : styles.iconCircleLocked]}>
                    <Ionicons
                      name={(unlocked ? badge.icon : 'lock-closed') as never}
                      size={26}
                      color={unlocked ? '#fff' : COLORS.grey}
                    />
                  </View>
                  <Text style={[styles.badgeLabel, !unlocked && styles.badgeLabelLocked]}>{badge.label}</Text>
                  <Text style={styles.badgeDescription}>{badge.description}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20, backgroundColor: COLORS.bg, flexGrow: 1 },
  progressText: { fontSize: 13, color: COLORS.grey, marginBottom: 16, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  badgeCard: {
    width: '47%', backgroundColor: COLORS.surface, borderRadius: 14,
    padding: 14, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8,
    elevation: 1,
  },
  badgeCardLocked: { opacity: 0.55 },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  iconCircleUnlocked: { backgroundColor: COLORS.orange },
  iconCircleLocked: { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border },
  badgeLabel: { fontSize: 13, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  badgeLabelLocked: { color: COLORS.grey },
  badgeDescription: { fontSize: 11, color: COLORS.grey, textAlign: 'center', marginTop: 4, lineHeight: 15 },
});
