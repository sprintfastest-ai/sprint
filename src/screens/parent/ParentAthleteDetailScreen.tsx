import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { parentApi, type AthleteProgress } from '@/api/parent';
import type { ParentStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<ParentStackParamList, 'AthleteDetail'>;
type RoutePropType = RouteProp<ParentStackParamList, 'AthleteDetail'>;

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

export default function ParentAthleteDetailScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { athleteId, email } = route.params;

  const [progress, setProgress] = useState<AthleteProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    parentApi.getAthleteProgress(athleteId)
      .then(setProgress)
      .catch(() => setProgress(null))
      .finally(() => setLoading(false));
  }, [athleteId]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{email}</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>Personal Bests</Text>
          {progress?.personalBests.length ? (
            <View style={styles.pbGrid}>
              {progress.personalBests.map((pb) => (
                <View key={pb.distance} style={styles.pbCard}>
                  <Text style={styles.pbDistance}>{pb.distance}m</Text>
                  <Text style={styles.pbTime}>{pb.timeSeconds.toFixed(2)}s</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No personal bests logged yet.</Text>
          )}

          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {progress?.sessions.length ? (
            progress.sessions.slice(0, 8).map((s) => (
              <View key={s.id} style={styles.sessionRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                <Text style={styles.sessionText}>
                  {new Date(s.completedAt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No sessions completed yet.</Text>
          )}

          <Text style={styles.sectionTitle}>Weakness Diagnosis</Text>
          {progress?.diagnoses.length ? (
            <View style={styles.diagnosisCard}>
              <Ionicons name="medical" size={18} color={COLORS.orange} />
              <Text style={styles.diagnosisText}>
                {progress.diagnoses[0]?.weaknessType.replace(/_/g, ' ')}
              </Text>
            </View>
          ) : (
            <Text style={styles.emptyText}>No diagnosis completed yet.</Text>
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
    paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1, textAlign: 'center' },
  content: { padding: 20, backgroundColor: COLORS.bg, flexGrow: 1 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginTop: 20, marginBottom: 10 },
  emptyText: { fontSize: 13, color: COLORS.grey },
  pbGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pbCard: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12, minWidth: 80, alignItems: 'center' },
  pbDistance: { fontSize: 12, color: COLORS.grey, fontWeight: '600' },
  pbTime: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  sessionText: { fontSize: 13, color: COLORS.text },
  diagnosisCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 14,
  },
  diagnosisText: { fontSize: 14, fontWeight: '700', color: COLORS.text, textTransform: 'capitalize' },
});
