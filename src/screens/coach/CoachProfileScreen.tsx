import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/hooks/useAuth';
import { coachApi } from '@/api/coach';
import { linksApi } from '@/api/links';

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  green: '#6DC400',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
  error: '#C0392B',
};

export default function CoachProfileScreen() {
  const { user, logout } = useAuth();
  const [clubName, setClubName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    coachApi.getMyProfile()
      .then((p) => {
        setClubName(p.clubName ?? '');
        setBio(p.bio ?? '');
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await coachApi.updateMyProfile({ clubName, bio });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Something went wrong', 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }, [clubName, bio]);

  const handleLinkAthlete = useCallback(async () => {
    if (!code.trim()) return;
    setLinking(true);
    try {
      await linksApi.redeemInvite(code.trim().toUpperCase());
      setCode('');
      Alert.alert('Linked!', 'The athlete has been added to your roster.');
    } catch (err) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      Alert.alert('Could not link', anyErr?.response?.data?.error ?? 'That code is invalid or expired.');
    } finally {
      setLinking(false);
    }
  }, [code]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Coach Profile</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>CLUB NAME</Text>
          <TextInput style={styles.input} value={clubName} onChangeText={setClubName} placeholder="e.g. Falkirk Track Club" placeholderTextColor={COLORS.grey} />
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>BIO</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell athletes a bit about your coaching background"
            placeholderTextColor={COLORS.grey}
            multiline
          />
          <TouchableOpacity style={[styles.saveBtn, saving && styles.btnDisabled]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Profile</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>LINK AN ATHLETE</Text>
          <Text style={styles.hint}>Enter the code an athlete shared with you to add them to your roster.</Text>
          <View style={styles.codeRow}>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="ABC123"
              placeholderTextColor={COLORS.grey}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity style={[styles.linkBtn, (!code.trim() || linking) && styles.btnDisabled]} onPress={handleLinkAthlete} disabled={!code.trim() || linking}>
              {linking ? <ActivityIndicator color="#fff" /> : <Text style={styles.linkBtnText}>Link</Text>}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  content: { padding: 20, backgroundColor: COLORS.bg, flexGrow: 1 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.grey, marginTop: 4, marginBottom: 20 },
  card: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: COLORS.grey, letterSpacing: 0.5, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.text,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 13,
    alignItems: 'center', marginTop: 16, minHeight: 46, justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  btnDisabled: { opacity: 0.5 },
  hint: { fontSize: 13, color: COLORS.grey, marginBottom: 12, lineHeight: 18 },
  codeRow: { flexDirection: 'row', gap: 10 },
  codeInput: {
    flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: COLORS.text,
    letterSpacing: 2, fontWeight: '700',
  },
  linkBtn: {
    backgroundColor: COLORS.orange, borderRadius: 10, paddingHorizontal: 20,
    alignItems: 'center', justifyContent: 'center', minWidth: 76,
  },
  linkBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, marginTop: 8,
  },
  signOutText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
});
