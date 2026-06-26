import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

type DayState = 'active' | 'completed' | 'upcoming';

interface Day {
  abbr: string;
  date: number;
  state: DayState;
}

interface Drill {
  name: string;
  detail: string;
  cue: string;
}

const DAYS: Day[] = [
  { abbr: 'Mon', date: 2,  state: 'active'    },
  { abbr: 'Tue', date: 3,  state: 'completed' },
  { abbr: 'Wed', date: 4,  state: 'upcoming'  },
  { abbr: 'Thu', date: 5,  state: 'upcoming'  },
  { abbr: 'Fri', date: 6,  state: 'upcoming'  },
  { abbr: 'Sat', date: 7,  state: 'upcoming'  },
  { abbr: 'Sun', date: 8,  state: 'upcoming'  },
];

const DRILLS: Drill[] = [
  { name: 'A-Skip',       detail: '4 sets × 20m',    cue: 'Drive your knees high'           },
  { name: 'Wall Drives',  detail: '3 sets × 10 reps', cue: 'Stay at 45 degrees'             },
  { name: 'Block Starts', detail: '5 runs × 30m',    cue: 'Explosive first 3 steps'         },
  { name: 'Flying 30s',   detail: '4 runs × 30m',    cue: 'Reach top speed before the cone' },
];

export default function TrainingScreen() {
  const [_selectedDay, setSelectedDay] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleToggle = useCallback((idx: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => (prev === idx ? null : idx));
  }, []);

  const handleComplete = useCallback(() => {
    setCompleted(true);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Plan</Text>
        <Text style={styles.headerSub}>Week of 2 Jun</Text>

        {/* Day strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStrip}
        >
          {DAYS.map((day, i) => {
            const isActive    = day.state === 'active';
            const isCompleted = day.state === 'completed';
            return (
              <TouchableOpacity
                key={day.abbr}
                onPress={() => setSelectedDay(i)}
                style={[
                  styles.dayPill,
                  isActive    && styles.dayPillActive,
                  isCompleted && styles.dayPillCompleted,
                ]}
                accessibilityLabel={`${day.abbr} ${day.date}`}
              >
                <Text style={[
                  styles.dayAbbr,
                  isActive    && styles.dayAbbrActive,
                  isCompleted && styles.dayAbbrCompleted,
                ]}>
                  {day.abbr}
                </Text>
                {isCompleted ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text style={[
                    styles.dayNum,
                    isActive && styles.dayNumActive,
                  ]}>
                    {day.date}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Session card */}
        <View style={styles.sessionCard}>
          {/* Card header */}
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>Acceleration Focus</Text>
              <View style={styles.durationPill}>
                <Text style={styles.durationPillText}>45 min</Text>
              </View>
            </View>
            <Text style={styles.cardSub}>Drive phase mechanics · 4 drills</Text>
          </View>

          <View style={styles.divider} />

          {/* Drill list */}
          {DRILLS.map((drill, i) => (
            <View key={drill.name}>
              <TouchableOpacity
                onPress={() => handleToggle(i)}
                style={[
                  styles.drillRow,
                  (i < DRILLS.length - 1 || expanded === i) && styles.drillRowBorder,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${drill.name}, ${drill.detail}`}
              >
                <View style={styles.drillNumber}>
                  <Text style={styles.drillNumberText}>{i + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.drillName}>{drill.name}</Text>
                  <Text style={styles.drillDetail}>{drill.detail}</Text>
                </View>
                <Text style={[
                  styles.chevron,
                  expanded === i && styles.chevronOpen,
                ]}>
                  {'⌄'}
                </Text>
              </TouchableOpacity>

              {expanded === i && (
                <View style={[
                  styles.cueRow,
                  i < DRILLS.length - 1 && styles.drillRowBorder,
                ]}>
                  <Text style={styles.cueText}>💡 {drill.cue}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Coaching cue banner */}
          <View style={styles.coachCueBanner}>
            <Text style={styles.coachCueIcon}>{'➤'}</Text>
            <Text style={styles.coachCueText}>
              <Text style={styles.coachCueLabel}>Coach's Cue: </Text>
              Keep your hips tall throughout the acceleration phase. Don't rush the transition to upright running.
            </Text>
          </View>

          {/* Complete session button */}
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
  dayPillCompleted: { borderColor: COLORS.green, borderWidth: 1.5 },
  dayAbbr: { fontSize: 11, fontWeight: '600', color: COLORS.grey, letterSpacing: 0.4 },
  dayAbbrActive: { color: '#FFFFFF' },
  dayAbbrCompleted: { color: COLORS.green },
  checkmark: { fontSize: 16, color: COLORS.green, fontWeight: '700' },
  dayNum: { fontSize: 16, fontWeight: '700', color: COLORS.grey, lineHeight: 20 },
  dayNumActive: { color: '#FFFFFF' },

  separator: { height: 1, backgroundColor: COLORS.border },

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
