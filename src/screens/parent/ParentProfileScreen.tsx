import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '@/hooks/useAuth';
import { linksApi } from '@/api/links';

const COLORS = {
  primary: '#1A6BB5',
  orange: '#F05A1A',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
  error: '#C0392B',
};

export default function ParentProfileScreen() {
  const { user, logout } = useAuth();
  const [code, setCode] = useState('');
  const [linking, setLinking] = useState(false);

  const handleLinkAthlete = useCallback(async () => {
    if (!code.trim()) return;
    setLinking(true);
    try {
      await linksApi.redeemInvite(code.trim().toUpperCase());
      setCode('');
      Alert.alert('Linked!', 'The athlete has been added to your account.');
    } catch (err) {
      const anyErr = err as { response?: { data?: { error?: string } } };
      Alert.alert('Could not link', anyErr?.response?.data?.error ?? 'That code is invalid or expired.');
    } finally {
      setLinking(false);
    }
  }, [code]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Parent Profile</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.card}>
          <Text style={styles.sectionLabel}>LINK AN ATHLETE</Text>
          <Text style={styles.hint}>Enter the code your athlete shared with you.</Text>
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
  btnDisabled: { opacity: 0.5 },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, marginTop: 8,
  },
  signOutText: { color: COLORS.error, fontWeight: '700', fontSize: 15 },
});
