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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { trainingApi } from '@/api/training';
import type { TrainingPlan, TrainingDay, Drill } from '@/types';

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
  const user = useAuthStore((s) => s.user);
  const [plan, setPlan] = useState<TrainingPlan | null>(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlan = useCallback(() => {
    const athleteId = user?.athleteId ?? user?.id;
    if (!athleteId) return;
    setLoading(true);
    setError(null);
    const weekStart = getWeekStartDate();
    trainingApi.getWeeklyPlan(athleteId, weekStart)
      .then((p) => {
        setPlan(p);
        const todayJS = new Date().getDay();
        const todayPlan = todayJS === 0 ? 6 : todayJS - 1;
        setSelectedDayIdx(Math.min(todayPlan, p.days.length - 1));
      })
      .catch(() => setError('Could not load training plan'))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  const handleToggle = useCallback((idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === idx ? null : idx));
  }, []);

  const handleComplete = useCallback(async () => {
    if (!plan || !user) return;
    const athleteId = user.athleteId ?? user.id;
    setCompleted(true);
    try {
      await trainingApi.completeSession(athleteId, plan.id, []);
    } catch {
      // best-effort — UI already reflects complete
    }
  }, [plan, user]);

  const weekStart = plan ? new Date(plan.weekStartDate) : new Date();
  const weekLabel = weekStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

  const todayDay: TrainingDay | undefined = plan?.days[selectedDayIdx];

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

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.primary} size="large" />
            <Text style={styles.loadingText}>Building your plan...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadPlan}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : todayDay ? (
          <View style={styles.sessionCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>{todayDay.sessionType}</Text>
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
                    <Text style={styles.cueText}>💡 {drill.cue}</Text>
                    {drill.restSeconds > 0 && (
                      <Text style={[styles.cueText, { marginTop: 4 }]}>⏱ {drill.restSeconds}s rest</Text>
                    )}
                  </View>
                )}
              </View>
            ))}

            {todayDay.coachingCues.length > 0 && (
              <View style={styles.coachCueBanner}>
                <Text style={styles.coachCueIcon}>{'➤'}</Text>
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
                <Text style={styles.completeBtnIcon}>{'✓'}</Text>
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
