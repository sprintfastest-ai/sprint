import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { parentApi, type ParentLinkedAthlete } from '@/api/parent';
import type { ParentStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<ParentStackParamList>;

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
};

export default function ParentOverviewScreen() {
  const navigation = useNavigation<NavProp>();
  const [athletes, setAthletes] = useState<ParentLinkedAthlete[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    parentApi.getLinkedAthletes()
      .then(setAthletes)
      .catch(() => setAthletes([]))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Athletes</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : athletes.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={40} color={COLORS.grey} />
          <Text style={styles.emptyTitle}>No linked athletes yet</Text>
          <Text style={styles.emptyBody}>Ask your athlete to invite you from their Profile screen, then enter the code from your Profile tab.</Text>
        </View>
      ) : (
        <FlatList
          data={athletes}
          keyExtractor={(a) => a.athleteId}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('AthleteDetail', { athleteId: item.athleteId, email: item.email })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.email.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardEmail}>{item.email}</Text>
                <Text style={styles.cardMeta}>
                  {item.ageGroup ?? 'No age group'} · {item.primaryEvent ?? 'No event set'}
                </Text>
              </View>
              {item.streakCount > 0 && (
                <View style={styles.streakPill}>
                  <Ionicons name="flame" size={12} color={COLORS.orange} />
                  <Text style={styles.streakText}>{item.streakCount}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={COLORS.grey} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: { paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  list: { padding: 16, backgroundColor: COLORS.bg, flexGrow: 1 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4,
  },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  cardEmail: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardMeta: { fontSize: 12, color: COLORS.grey, marginTop: 2 },
  streakPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF3EC', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 4 },
  streakText: { fontSize: 12, fontWeight: '700', color: COLORS.orange },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: 8 },
  emptyBody: { fontSize: 13, color: COLORS.grey, textAlign: 'center', lineHeight: 19 },
});
