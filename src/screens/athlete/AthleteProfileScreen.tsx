import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useTraining } from '@/hooks/useTraining';
import { profileApi } from '@/api/training';
import type { AthleteProfile } from '@/api/training';

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
};

const AGE_GROUPS = ['U11', 'U13', 'U15', 'U17', 'U20'];
const EVENTS = ['100m', '200m', '60m', '400m', '4×100m relay'];

export default function AthleteProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [loggingOut, setLoggingOut] = useState(false);
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { sessions, personalBests, loadSessionHistory, loadPersonalBests } = useTraining();

  useEffect(() => {
    loadSessionHistory();
    loadPersonalBests();
    profileApi.getMyProfile()
      .then(setProfile)
      .catch(() => null)
      .finally(() => setProfileLoading(false));
  }, [loadSessionHistory, loadPersonalBests]);

  const selectedAgeGroup = profile?.ageGroup ?? null;
  const selectedEvents = profile?.primaryEvent
    ? profile.primaryEvent.split(',').map((e) => e.trim())
    : [];

  const toggleAgeGroup = useCallback(async (group: string) => {
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await profileApi.updateMyProfile({ ageGroup: group });
      setProfile((p) => p ? { ...p, ageGroup: updated.ageGroup } : p);
    } catch {
      Alert.alert('Error', 'Could not save age group. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [profile]);

  const toggleEvent = useCallback(async (event: string) => {
    if (!profile) return;
    const current = profile.primaryEvent
      ? profile.primaryEvent.split(',').map((e) => e.trim())
      : [];
    const next = current.includes(event)
      ? current.filter((e) => e !== event)
      : [...current, event];
    const primaryEvent = next.join(', ');
    setSaving(true);
    try {
      const updated = await profileApi.updateMyProfile({ primaryEvent });
      setProfile((p) => p ? { ...p, primaryEvent: updated.primaryEvent } : p);
    } catch {
      Alert.alert('Error', 'Could not save events. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [profile]);

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : '??';
  const firstName = user?.email?.split('@')[0] ?? 'Athlete';

  const sessionCount = sessions.length;
  const pb100m = personalBests.find((pb) => pb.distance === 100);
  const pb100mStr = pb100m ? `${pb100m.timeSeconds.toFixed(2)}s` : '–';
  const streak = (() => {
    if (!sessions.length) return 0;
    const days = new Set(sessions.map((s) => new Date(s.completedAt).toDateString()));
    let count = 0;
    const d = new Date();
    while (days.has(d.toDateString())) { count++; d.setDate(d.getDate() - 1); }
    return count;
  })();

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

  const handleChangePassword = useCallback(() => {
    Alert.alert(
      'Change Password',
      'A password reset link will be sent to your email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Link',
          onPress: () => Alert.alert('Email Sent', 'Check your inbox for the password reset link.'),
        },
      ],
    );
  }, []);

  const handlePrivacyPolicy = useCallback(() => {
    Linking.openURL('https://sprintfastest.com/privacy').catch(() =>
      Alert.alert('Error', 'Could not open the privacy policy.'),
    );
  }, []);

  const handleHelpSupport = useCallback(() => {
    Linking.openURL('mailto:support@sprintfastest.com').catch(() =>
      Alert.alert('Help & Support', 'Email us at support@sprintfastest.com'),
    );
  }, []);

  const handleNotifications = useCallback(() => {
    Alert.alert('Notifications', 'Notification settings coming soon.');
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          {saving && <ActivityIndicator size="small" color={COLORS.primary} />}
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
          {profileLoading ? (
            <ActivityIndicator color={COLORS.primary} size="small" style={{ marginTop: 4 }} />
          ) : (
            <View style={styles.pillRow}>
              {AGE_GROUPS.map((g) => {
                const active = selectedAgeGroup === g;
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => toggleAgeGroup(g)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Events */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>EVENTS</Text>
          {profileLoading ? (
            <ActivityIndicator color={COLORS.primary} size="small" style={{ marginTop: 4 }} />
          ) : (
            <View style={styles.pillRow}>
              {EVENTS.map((e) => {
                const active = selectedEvents.includes(e);
                return (
                  <TouchableOpacity
                    key={e}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => toggleEvent(e)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>{e}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{pb100mStr}</Text>
            <Text style={styles.statLabel}>100m PB</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{sessionCount}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsCard}>
          <SettingsRow icon="🔔" label="Notifications" onPress={handleNotifications} />
          <View style={styles.rowDivider} />
          <SettingsRow icon="🔒" label="Change Password" onPress={handleChangePassword} />
          <View style={styles.rowDivider} />
          <SettingsRow icon="📋" label="Privacy Policy" onPress={handlePrivacyPolicy} />
          <View style={styles.rowDivider} />
          <SettingsRow icon="❓" label="Help & Support" onPress={handleHelpSupport} />
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
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
