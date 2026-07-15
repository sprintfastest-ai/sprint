import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { AthleteStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<AthleteStackParamList, 'DiagnosisResults'>;
type RoutePropType = RouteProp<AthleteStackParamList, 'DiagnosisResults'>;

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  green: '#6DC400',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
};

const WEAKNESS_LABELS: Record<string, { label: string; description: string; icon: string }> = {
  acceleration: {
    label: 'Acceleration',
    description: 'Your first 10-30m out of the blocks/start is the biggest opportunity for improvement.',
    icon: 'rocket',
  },
  top_speed: {
    label: 'Top Speed',
    description: 'Your maximum velocity phase (30-60m) is where you have the most room to improve.',
    icon: 'speedometer',
  },
  speed_endurance: {
    label: 'Speed Endurance',
    description: 'Maintaining speed in the back half of your race is your key growth area.',
    icon: 'infinite',
  },
};

export default function DiagnosisResultsScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { diagnosis } = route.params;
  const info = WEAKNESS_LABELS[diagnosis.weaknessType] ?? {
    label: diagnosis.weaknessType,
    description: '',
    icon: 'ribbon',
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.iconCircle}>
          <Ionicons name={info.icon as never} size={36} color="#fff" />
        </View>
        <Text style={styles.eyebrow}>Your primary weakness is</Text>
        <Text style={styles.title}>{info.label}</Text>
        <Text style={styles.description}>{info.description}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Prescribed Drills</Text>
          {diagnosis.drillPrescription.map((drill, i) => (
            <View key={`${drill.name}-${i}`} style={[styles.drillRow, i > 0 && styles.drillRowBorder]}>
              <View style={styles.drillIconWrap}>
                <Ionicons name="barbell" size={16} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.drillName}>{drill.name}</Text>
                <Text style={styles.drillMeta}>
                  {drill.sets} sets × {drill.reps} reps{drill.distance ? ` · ${drill.distance}m` : ''}
                </Text>
                {!!drill.cue && <Text style={styles.drillCue}>{drill.cue}</Text>}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footnote}>
          These drills have been added to your training plan focus. Retake this diagnosis in 4 weeks to track your progress.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.navigate('Tabs', { screen: 'Training' } as never)}
        >
          <Text style={styles.doneBtnText}>View My Training Plan</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { padding: 24, alignItems: 'center', paddingBottom: 8 },
  iconCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.orange, alignItems: 'center', justifyContent: 'center',
    marginTop: 12, marginBottom: 16,
  },
  eyebrow: { fontSize: 13, color: COLORS.grey, textTransform: 'uppercase', letterSpacing: 0.6 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginTop: 4 },
  description: { fontSize: 14, color: COLORS.grey, textAlign: 'center', marginTop: 10, lineHeight: 20, paddingHorizontal: 8 },
  card: {
    width: '100%', backgroundColor: COLORS.bg, borderRadius: 16,
    padding: 16, marginTop: 28,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  drillRow: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  drillRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  drillIconWrap: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#EBF5FB', alignItems: 'center', justifyContent: 'center',
  },
  drillName: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  drillMeta: { fontSize: 12, color: COLORS.grey, marginTop: 2 },
  drillCue: { fontSize: 12, color: COLORS.primary, marginTop: 4, fontStyle: 'italic' },
  footnote: { fontSize: 12, color: COLORS.grey, textAlign: 'center', marginTop: 20, lineHeight: 17 },
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: COLORS.border },
  doneBtn: {
    backgroundColor: COLORS.primary, borderRadius: 12,
    paddingVertical: 15, alignItems: 'center', minHeight: 52, justifyContent: 'center',
  },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
