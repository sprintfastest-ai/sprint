import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useTraining } from '@/hooks/useTraining';
import { getWeekStartDate } from '@/utils/formatters';

export default function AthleteDashboardScreen() {
  const { user } = useAuth();
  const { currentPlan, loadWeeklyPlan, isLoading } = useTraining();

  useEffect(() => {
    loadWeeklyPlan(getWeekStartDate());
  }, [loadWeeklyPlan]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Welcome back</Text>
      <Text style={styles.name}>{user?.email}</Text>
      {currentPlan ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>This Week's Plan</Text>
          <Text style={styles.cardSub}>{currentPlan.days.length} sessions</Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardSub}>
            {isLoading ? 'Loading plan…' : 'No plan for this week yet.'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  content: { padding: 24, paddingTop: 60 },
  greeting: { fontSize: 14, color: '#888' },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardSub: { fontSize: 14, color: '#888' },
});
