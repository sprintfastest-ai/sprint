import React, { useCallback, useEffect, useState } from 'react';
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
import { leaderboardApi, type LeaderboardEntry } from '@/api/leaderboard';
import type { AthleteStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<AthleteStackParamList, 'Leaderboard'>;

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  green: '#6DC400',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
  blueLight: '#EBF5FB',
};

const MEDAL_COLORS = ['#F0B429', '#B0B7C3', '#C97B3D']; // gold / silver / bronze

export default function LeaderboardScreen() {
  const navigation = useNavigation<NavProp>();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [ageGroup, setAgeGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaywallError, setIsPaywallError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    setIsPaywallError(false);
    leaderboardApi.getMyLeaderboard()
      .then((res) => {
        setEntries(res.entries);
        setAgeGroup(res.ageGroup);
      })
      .catch((err) => {
        const anyErr = err as { response?: { data?: { error?: string; code?: string } } };
        setError(anyErr?.response?.data?.error ?? 'Could not load the leaderboard.');
        setIsPaywallError(anyErr?.response?.data?.code === 'PREMIUM_REQUIRED');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={28} color={COLORS.grey} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => (isPaywallError ? navigation.navigate('Paywall', undefined) : load())}
          >
            <Text style={styles.retryBtnText}>{isPaywallError ? 'Upgrade to Premium' : 'Try Again'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {ageGroup && <Text style={styles.subtitle}>{ageGroup} · This week · Ranked by sessions completed</Text>}

          {entries.length === 0 ? (
            <Text style={styles.emptyText}>
              No one in your age group has logged a session yet this week — be the first!
            </Text>
          ) : (
            <View style={styles.list}>
              {entries.map((e) => (
                <View
                  key={e.athleteId}
                  style={[styles.row, e.isSelf && styles.rowSelf]}
                >
                  <View style={[styles.rankBadge, e.consistencyRank <= 3 && { backgroundColor: MEDAL_COLORS[e.consistencyRank - 1] }]}>
                    <Text style={[styles.rankText, e.consistencyRank <= 3 && styles.rankTextMedal]}>
                      {e.consistencyRank}
                    </Text>
                  </View>
                  <Text style={styles.name} numberOfLines={1}>
                    {e.displayName}{e.isSelf ? ' (you)' : ''}
                  </Text>
                  <View style={styles.statsCol}>
                    <Text style={styles.statPrimary}>{e.sessionsThisWeek} session{e.sessionsThisWeek !== 1 ? 's' : ''}</Text>
                    <Text style={styles.statSecondary}>
                      🔥 {e.streakCount} day{e.streakCount !== 1 ? 's' : ''}
                      {e.pbImprovementCount > 0 ? ` · 🏆 ${e.pbImprovementCount} PB${e.pbImprovementCount !== 1 ? 's' : ''}` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20, paddingBottom: 40 },
  subtitle: { fontSize: 12, color: COLORS.grey, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyText: { fontSize: 14, color: COLORS.grey, textAlign: 'center', marginTop: 40, lineHeight: 20 },
  list: { gap: 10 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.bg, borderRadius: 12, padding: 12,
  },
  rowSelf: { backgroundColor: COLORS.blueLight, borderWidth: 1.5, borderColor: COLORS.primary },
  rankBadge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },
  rankText: { fontSize: 13, fontWeight: '700', color: COLORS.grey },
  rankTextMedal: { color: '#fff' },
  name: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  statsCol: { alignItems: 'flex-end' },
  statPrimary: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  statSecondary: { fontSize: 11, color: COLORS.grey, marginTop: 2 },
  errorBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  errorText: { fontSize: 14, color: COLORS.grey, textAlign: 'center' },
  retryBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10,
    paddingHorizontal: 20, paddingVertical: 12, marginTop: 8,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
