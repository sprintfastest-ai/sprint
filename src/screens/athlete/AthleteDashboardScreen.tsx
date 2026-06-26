import React, { useEffect, useCallback } from 'react';
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
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';
import { useTraining } from '@/hooks/useTraining';
import { getWeekStartDate } from '@/utils/formatters';
import type { AthleteTabParamList } from '@/navigation/types';

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

type NavProp = BottomTabNavigationProp<AthleteTabParamList>;

export default function AthleteDashboardScreen() {
  const navigation = useNavigation<NavProp>();
  const user = useAuthStore((s) => s.user);
  const { currentPlan, loadWeeklyPlan, isLoading } = useTraining();

  useEffect(() => {
    loadWeeklyPlan(getWeekStartDate());
  }, [loadWeeklyPlan]);

  const firstName = user?.email?.split('@')[0] ?? 'Athlete';
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const todayDay = currentPlan?.days[today.getDay() === 0 ? 6 : today.getDay() - 1];
  const drillNames = todayDay?.drills.slice(0, 4).map((d) => d.name) ?? [];

  const handleStartSession = useCallback(() => {
    navigation.navigate('Training');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting} numberOfLines={1}>
            Good morning, {firstName} 👋
          </Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <TouchableOpacity style={styles.bellBtn} accessibilityLabel="Notifications">
          <BellIcon />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Streak card */}
        <View style={styles.streakCard}>
          <SpeedLines />
          <View style={styles.streakLeft}>
            <View style={styles.flameWrap}>
              <FlameIcon />
            </View>
            <View>
              <Text style={styles.streakCount}>7</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
          </View>
          <Text style={styles.streakBest}>🏆 Best: 12 days</Text>
        </View>

        {/* Today's session card */}
        <View style={styles.sessionCard}>
          <Text style={styles.sectionLabel}>TODAY'S SESSION</Text>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
          ) : todayDay ? (
            <>
              <Text style={styles.sessionTitle}>{todayDay.sessionType}</Text>
              <View style={styles.drillPills}>
                {drillNames.map((name) => (
                  <View key={name} style={styles.drillPill}>
                    <Text style={styles.drillPillText}>{name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.sessionFooter}>
                <View style={styles.sessionDuration}>
                  <ClockIcon />
                  <Text style={styles.sessionDurationText}>Est. 45 min</Text>
                </View>
                <TouchableOpacity style={styles.startBtn} onPress={handleStartSession}>
                  <Text style={styles.startBtnText}>Start Session →</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.sessionTitle}>Acceleration Focus</Text>
              <View style={styles.drillPills}>
                {['A-Skip', 'Wall Drives', 'Block Starts', 'Flying 30s'].map((name) => (
                  <View key={name} style={styles.drillPill}>
                    <Text style={styles.drillPillText}>{name}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.sessionFooter}>
                <View style={styles.sessionDuration}>
                  <ClockIcon />
                  <Text style={styles.sessionDurationText}>Est. 45 min</Text>
                </View>
                <TouchableOpacity style={styles.startBtn} onPress={handleStartSession}>
                  <Text style={styles.startBtnText}>Start Session →</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {/* Weekly goal ring */}
          <View style={[styles.statCard, { alignItems: 'center' }]}>
            <RingProgress value={3} max={5} />
            <Text style={[styles.sectionLabel, { marginTop: 10 }]}>WEEKLY GOAL</Text>
          </View>

          {/* 100m PB */}
          <View style={[styles.statCard, { justifyContent: 'center' }]}>
            <Text style={styles.sectionLabel}>100M PB</Text>
            <Text style={styles.pbTime}>13.2s</Text>
            <View style={styles.pbBadge}>
              <CheckCircleIcon />
              <Text style={styles.pbBadgeText}>Personal Best</Text>
            </View>
          </View>
        </View>

        {/* AI insight card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <RobotIcon />
            <Text style={styles.insightTitle}>Your Coach's Take</Text>
          </View>
          <Text style={styles.insightBody}>
            Your consistency has been excellent this week. Focus on explosive drive phase work today.
          </Text>
          <Text style={styles.insightFooter}>Updated today</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Ring Progress ────────────────────────────────────────────────

function RingProgress({ value, max }: { value: number; max: number }) {
  const size = 72;
  const strokeW = 9;
  const r = (size - strokeW * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / max) * circ;
  const complete = value >= max;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Track ring drawn with border */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeW,
          borderColor: COLORS.border,
        }}
      />
      {/* Center label */}
      <View style={{ alignItems: 'center' }}>
        {complete ? (
          <Text style={{ fontSize: 18, color: COLORS.green }}>✓</Text>
        ) : (
          <>
            <Text style={{ fontSize: 17, fontWeight: '700', color: COLORS.text, lineHeight: 20 }}>
              {value}/{max}
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.grey }}>sessions</Text>
          </>
        )}
      </View>
      {/* Progress arc overlay — simple orange border trick */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeW,
          borderColor: 'transparent',
          borderTopColor: COLORS.green,
          transform: [{ rotate: `${-90 + (value / max) * 360}deg` }],
        }}
      />
    </View>
  );
}

// ── SVG Icons (inline, no library) ──────────────────────────────

function SpeedLines() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: i * 40 - 20,
            top: 0,
            bottom: 0,
            width: 18,
            backgroundColor: 'rgba(255,255,255,0.05)',
            transform: [{ skewX: '-20deg' }],
          }}
        />
      ))}
    </View>
  );
}

function FlameIcon() {
  return <Text style={{ fontSize: 36 }}>🔥</Text>;
}

function BellIcon() {
  return (
    <Text style={{ fontSize: 22, color: COLORS.primary }}>🔔</Text>
  );
}

function ClockIcon() {
  return <Text style={{ fontSize: 14 }}>🕐</Text>;
}

function CheckCircleIcon() {
  return <Text style={{ fontSize: 14, color: COLORS.green }}>✓</Text>;
}

function RobotIcon() {
  return <Text style={{ fontSize: 18 }}>🤖</Text>;
}

// ── Styles ────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  date: { fontSize: 13, color: COLORS.grey },
  bellBtn: { padding: 4 },

  streakCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    height: 100,
    backgroundColor: COLORS.orange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  streakLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  flameWrap: { alignItems: 'center', justifyContent: 'center' },
  streakCount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 44,
    letterSpacing: -1.5,
  },
  streakLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  streakBest: { fontSize: 13, color: 'rgba(255,255,255,0.90)', fontWeight: '500' },

  sessionCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    padding: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.grey,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 10,
    lineHeight: 22,
  },
  drillPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  drillPill: {
    backgroundColor: COLORS.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  drillPillText: { fontSize: 12, fontWeight: '500', color: COLORS.grey },
  sessionFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sessionDuration: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessionDurationText: { fontSize: 13, color: COLORS.grey },
  startBtn: {
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.orange,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },

  statsRow: { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginTop: 12 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pbTime: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 8,
    marginTop: 6,
  },
  pbBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pbBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.green },

  insightCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: COLORS.blueLight,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: 16,
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  insightTitle: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  insightBody: { fontSize: 14, color: COLORS.text, lineHeight: 22, marginBottom: 8 },
  insightFooter: { fontSize: 12, color: COLORS.grey, textAlign: 'right' },
});
