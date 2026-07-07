import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  green: '#6DC400',
  error: '#C0392B',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
  blueLight: '#EBF5FB',
  orangeLight: '#FEF3EC',
};

const AGE_GROUPS = ['U11', 'U13', 'U15', 'U17', 'U20'];
const EVENTS = ['100m', '200m', '60m', '400m', '4×100m relay'];

export default function AthleteProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  const firstName = user?.email?.split('@')[0] ?? 'Athlete';

  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await logout().catch(() => undefined);
          setLoggingOut(false);
        },
      },
    ]);
  }, [logout]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{firstName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.rolePillText}>
              {user?.role?.toUpperCase() ?? 'ATHLETE'}
            </Text>
          </View>
        </View>

        {/* Age group */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AGE GROUP</Text>
          <View style={styles.pillRow}>
            {AGE_GROUPS.map((g) => (
              <View key={g} style={[styles.pill, g === 'U15' && styles.pillActive]}>
                <Text style={[styles.pillText, g === 'U15' && styles.pillTextActive]}>{g}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Events */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EVENTS</Text>
          <View style={styles.pillRow}>
            {EVENTS.map((e) => (
              <View key={e} style={[styles.pill, (e === '100m' || e === '200m') && styles.pillActive]}>
                <Text style={[styles.pillText, (e === '100m' || e === '200m') && styles.pillTextActive]}>{e}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>13.2s</Text>
            <Text style={styles.statLabel}>100m PB</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <SettingsRow icon="🔔" label="Notifications" onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingsRow icon="🔒" label="Change Password" onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingsRow icon="📋" label="Privacy Policy" onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingsRow icon="❓" label="Help & Support" onPress={() => {}} />
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={styles.signOutBtn}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={COLORS.error} />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>SprintFastest v1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress}>
      <Text style={styles.settingsIcon}>{icon}</Text>
      <Text style={styles.settingsLabel}>{label}</Text>
      <Text style={styles.settingsChevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flex: 1, backgroundColor: COLORS.bg },
  content: { paddingBottom: 40 },

  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, letterSpacing: -0.3 },

  avatarCard: {
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text, letterSpacing: -0.3, marginBottom: 4 },
  email: { fontSize: 14, color: COLORS.grey, marginBottom: 12 },
  rolePill: {
    backgroundColor: COLORS.blueLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  rolePillText: { fontSize: 11, fontWeight: '700', color: COLORS.primary, letterSpacing: 0.6 },

  section: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.grey,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 13, fontWeight: '500', color: COLORS.grey },
  pillTextActive: { color: '#FFFFFF', fontWeight: '700' },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5, marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '500', color: COLORS.grey, textAlign: 'center' },

  settingsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    gap: 12,
  },
  settingsIcon: { fontSize: 18 },
  settingsLabel: { flex: 1, fontSize: 15, color: COLORS.text, fontWeight: '500' },
  settingsChevron: { fontSize: 22, color: COLORS.grey, lineHeight: 26 },
  rowDivider: { height: 1, backgroundColor: COLORS.border, marginLeft: 48 },

  signOutBtn: {
    marginHorizontal: 20,
    marginBottom: 16,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },

  version: { textAlign: 'center', fontSize: 12, color: COLORS.grey },
});
