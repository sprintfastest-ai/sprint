import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthStore } from '@/store/authStore';
import { trainingApi } from '@/api/training';
import { getBadgeInfo } from '@/utils/badges';
import { formatSessionType } from '@/utils/formatters';
import type { TrainingPlan, TrainingDay, Drill } from '@/types';
import type { AthleteStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<AthleteStackParamList>;

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  green: '#6DC400',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
  orangeLight: '#FEF3EC',
  blueLight: '#F5F9FF',
};

const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekStartDate(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export default function TrainingScreen() {
  const navigation = useNavigation<NavProp>();
  const user = useAuthStore((s) => s.user);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaywallError, setIsPaywallError] = useState(false);

  const loadPlan = useCallback(() => {
    const athleteId = user?.athleteId ?? user?.id;
    if (!athleteId) return;
    setLoading(true);
    setError(null);
    setIsPaywallError(false);
    const weekStart = getWeekStartDate();
    trainingApi.getWeeklyPlan(athleteId, weekStart)
      .then((p) => {
        if (!p || !Array.isArray(p.days)) {
          setError('Training plan response was malformed. Please try again.');
          return;
        }
        setPlan(p);
        const todayJS = new Date().getDay();
        const todayPlan = todayJS === 0 ? 6 : todayJS - 1;
        setSelectedDayIdx(Math.min(todayPlan, p.days.length - 1));

        // Derive which days are already complete from persisted session
        // history, so the button state survives an app restart.
        trainingApi.getSessionHistory(athleteId)
          .then((sessions) => {
            const daysDone = new Set(
              sessions
                .filter((s) => s.planId === p.id && s.dayNumber != null)
                .map((s) => s.dayNumber as number),
            );
            setCompletedDays(daysDone);
          })
          .catch(() => setCompletedDays(new Set()));
      })
      .catch((err) => {
        // Surface the real error so we can actually debug
        const anyErr = err as { response?: { data?: { error?: string; message?: string; code?: string } }; message?: string };
        const serverMsg = anyErr?.response?.data?.error ?? anyErr?.response?.data?.message;
        setError(serverMsg ?? anyErr?.message ?? 'Could not load training plan');
        setIsPaywallError(anyErr?.response?.data?.code === 'PREMIUM_REQUIRED');
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  const handleToggle = useCallback((idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === idx ? null : idx));
  }, []);

  const todayDay: TrainingDay | undefined = plan?.days[selectedDayIdx];
  const completed = todayDay ? completedDays.has(todayDay.dayNumber) : false;

  const handleComplete = useCallback(async () => {
    if (!plan || !user || !todayDay) return;
    const athleteId = user.athleteId ?? user.id;
    const dayNumber = todayDay.dayNumber;
    setCompletedDays((prev) => new Set(prev).add(dayNumber));
    try {
      const session = await trainingApi.completeSession(athleteId, plan.id, [], dayNumber);
      if (session.newBadges?.length) {
        const names = session.newBadges.map((b) => getBadgeInfo(b.badgeType).label).join(', ');
        Alert.alert('New Badge Unlocked! 🎉', names, [
          { text: 'View Badges', onPress: () => navigation.navigate('Achievements') },
          { text: 'Nice!', style: 'cancel' },
        ]);
      }
    } catch {
      // best-effort — UI already reflects complete
    }
  }, [plan, user, todayDay, navigation]);

  const weekStart = plan ? new Date(plan.weekStartDate) : new Date();
  const weekLabel = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const drillDetail = (drill: Drill) => {
    const parts: string[] = [];
    if (drill.sets) parts.push(`${drill.sets} sets`);
    if (drill.reps) parts.push(`× ${drill.reps} reps`);
    if (drill.distance) parts.push(`× ${drill.distance}m`);
    return parts.join(' ') || '';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Plan</Text>
        <Text style={styles.headerSub}>Week of {weekLabel}</Text>

        {/* Day strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStrip}
        >
          {(plan?.days ?? Array.from({ length: 7 }, (_, i) => ({ dayNumber: i + 1, sessionType: '', drills: [], coachingCues: [] }))).map((_day, i) => {
            const isActive = i === selectedDayIdx;
            const dayDate = new Date(weekStart);
            dayDate.setDate(dayDate.getDate() + i);
            const abbr = DAY_ABBRS[dayDate.getDay()];
            const dateNum = dayDate.getDate();
            return (
              <TouchableOpacity
                key={i}
                onPress={() => { setSelectedDayIdx(i); setExpanded(null); }}
                style={[styles.dayPill, isActive && styles.dayPillActive]}
                accessibilityLabel={`${abbr} ${dateNum}`}
              >
                <Text style={[styles.dayAbbr, isActive && styles.dayAbbrActive]}>{abbr}</Text>
                <Text style={[styles.dayNum, isActive && styles.dayNumActive]}>{dateNum}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.separator} />

      {plan?.isTaperWeek && (
        <View style={styles.taperBanner}>
          <Ionicons name="trending-down" size={16} color={COLORS.orange} />
          <Text style={styles.taperText}>Race Taper Week — reduced volume to keep you fresh for race day.</Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Building your plan...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => (isPaywallError ? navigation.navigate('Paywall', undefined) : loadPlan())}
            >
              <Text style={styles.retryBtnText}>{isPaywallError ? 'Upgrade to Premium' : 'Try Again'}</Text>
            </TouchableOpacity>
          </View>
        ) : todayDay ? (
          <View style={styles.sessionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{formatSessionType(todayDay.sessionType)}</Text>
                <View style={styles.durationPill}>
                  <Text style={styles.durationPillText}>{todayDay.drills.length} drills</Text>
                </View>
              </View>
              <Text style={styles.cardSub}>{todayDay.coachingCues[0] ?? ''}</Text>
            </View>

            <View style={styles.divider} />

            {todayDay.drills.map((drill, i) => (
              <View key={i}>
                <TouchableOpacity
                  onPress={() => handleToggle(i)}
                  style={[
                    styles.drillRow,
                    (i < todayDay.drills.length - 1 || expanded === i) && styles.drillRowBorder,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${drill.name}`}
                >
                  <View style={styles.drillNumber}>
                    <Text style={styles.drillNumberText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.drillName}>{drill.name}</Text>
                    <Text style={styles.drillDetail}>{drillDetail(drill)}</Text>
                  </View>
                  <Text style={[styles.chevron, expanded === i && styles.chevronOpen]}>{'⌄'}</Text>
                </TouchableOpacity>

                {expanded === i && (
                  <View style={[styles.cueRow, i < todayDay.drills.length - 1 && styles.drillRowBorder]}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 5 }}>
                      <Ionicons name="bulb-outline" size={14} color={COLORS.orange} style={{ marginTop: 2 }} />
                      <Text style={[styles.cueText, { flex: 1 }]}>{drill.cue}</Text>
                    </View>
                    {drill.restSeconds > 0 && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                      <Ionicons name="timer-outline" size={13} color="#6B7280" />
                      <Text style={styles.cueText}>{drill.restSeconds}s rest</Text>
                    </View>
                    )}
                  </View>
                )}
              </View>
            ))}

            {todayDay.coachingCues.length > 0 && (
              <View style={styles.coachCueBanner}>
                <Ionicons name="chevron-forward-circle" size={18} color="#1A6BB5" style={{ marginRight: 6 }} />
                <Text style={styles.coachCueText}>
                  <Text style={styles.coachCueLabel}>Coach's Cue: </Text>
                  {todayDay.coachingCues[todayDay.coachingCues.length - 1]}
                </Text>
              </View>
            )}

            <View style={styles.completeWrap}>
              <TouchableOpacity
                style={[styles.completeBtn, completed && styles.completeBtnDone]}
                onPress={handleComplete}
                disabled={completed}
              >
                <Ionicons name={completed ? 'checkmark-circle' : 'checkmark-circle-outline'} size={20} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.completeBtnText}>
                  {completed ? 'Session Complete!' : 'Complete Session'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.centered}>
            <Text style={styles.loadingText}>Rest day — no session today.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 14, paddingBottom: 32 },
  taperBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.orangeLight, paddingHorizontal: 16, paddingVertical: 10,
  },
  taperText: { flex: 1, fontSize: 12, color: COLORS.text, fontWeight: '600' },

  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, letterSpacing: -0.3, marginBottom: 2 },
  headerSub: { fontSize: 13, color: COLORS.grey, marginBottom: 16 },

  dayStrip: { paddingBottom: 16, gap: 8 },
  dayPill: {
    width: 52,
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayPillActive: {
    backgroundColor: COLORS.primary,
    borderWidth: 0,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  dayAbbr: { fontSize: 11, fontWeight: '600', color: COLORS.grey, letterSpacing: 0.4 },
  dayAbbrActive: { color: '#FFFFFF' },
  dayNum: { fontSize: 16, fontWeight: '700', color: COLORS.grey, lineHeight: 20 },
  dayNumActive: { color: '#FFFFFF' },

  separator: { height: 1, backgroundColor: COLORS.border },

  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14, color: COLORS.grey, textAlign: 'center' },
  errorText: { fontSize: 14, color: '#C0392B', textAlign: 'center', marginBottom: 16 },
  retryBtn: {
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1A6BB5',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#1A6BB5' },

  sessionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: 'hidden',
  },

  cardHeader: { padding: 16, paddingBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, letterSpacing: -0.2, flex: 1 },
  durationPill: {
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  durationPillText: { fontSize: 12, fontWeight: '500', color: COLORS.grey },
  cardSub: { fontSize: 13, color: COLORS.grey },

  divider: { height: 1, backgroundColor: COLORS.border, marginHorizontal: 16 },

  drillRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 14,
    gap: 12,
  },
  drillRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  drillNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drillNumberText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  drillName: { fontSize: 15, fontWeight: '600', color: COLORS.text, lineHeight: 20, marginBottom: 2 },
  drillDetail: { fontSize: 13, color: COLORS.grey },
  chevron: { fontSize: 20, color: COLORS.grey, lineHeight: 24 },
  chevronOpen: { transform: [{ rotate: '180deg' }] },

  cueRow: {
    backgroundColor: COLORS.blueLight,
    paddingVertical: 10,
    paddingLeft: 58,
    paddingRight: 16,
  },
  cueText: { fontSize: 13, color: COLORS.primary, fontStyle: 'italic', lineHeight: 20 },

  coachCueBanner: {
    margin: 16,
    marginTop: 14,
    backgroundColor: COLORS.orangeLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
    borderRadius: 8,
    padding: 12,
    paddingLeft: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  coachCueIcon: { fontSize: 14, color: COLORS.orange, marginTop: 1 },
  coachCueText: { flex: 1, fontSize: 13, color: COLORS.text, lineHeight: 20, fontStyle: 'italic' },
  coachCueLabel: { fontStyle: 'normal', fontWeight: '600', color: COLORS.orange },

  completeWrap: { padding: 16, paddingTop: 0 },
  completeBtn: {
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: COLORS.green,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  completeBtnDone: { backgroundColor: '#5aab00' },
  completeBtnIcon: { fontSize: 18, color: '#FFFFFF', fontWeight: '700' },
  completeBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
