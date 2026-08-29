import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { contactSupport } from '@/api/support';
import type { AthleteStackParamList } from '@/navigation/types';

type NavProp = NativeStackNavigationProp<AthleteStackParamList, 'ContactSupport'>;

const COLORS = {
  primary: '#1A6BB5',
  green: '#6DC400',
  text: '#1A1A1A',
  grey: '#6B7280',
  border: '#E0E0E0',
  surface: '#FFFFFF',
  bg: '#F8F9FA',
  error: '#C0392B',
};

/**
 * Sends the message straight to the SprintFastest team via email
 * (backend/src/routes/support.ts) instead of opening the device's mail app
 * via a mailto: link — keeps the athlete in the app the whole time.
 */
export default function ContactSupportScreen() {
  const navigation = useNavigation<NavProp>();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = subject.trim().length > 0 && message.trim().length > 0;

  const handleSend = async () => {
    if (!canSubmit) return;
    setError(null);
    setSending(true);
    try {
      await contactSupport(subject.trim(), message.trim());
      setSent(true);
    } catch (err) {
      const anyErr = err as { response?: { data?: { error?: string } }; message?: string };
      setError(anyErr?.response?.data?.error ?? anyErr?.message ?? 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Support</Text>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {sent ? (
            <View style={styles.successBox} accessibilityLiveRegion="polite" accessibilityRole="alert">
              <Ionicons name="checkmark-circle" size={48} color={COLORS.green} style={{ marginBottom: 12 }} />
              <Text style={styles.successTitle}>Message sent</Text>
              <Text style={styles.successBody}>
                Thanks for reaching out — our team will get back to you by email.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.body}>
                Tell us what's going on — we'll reply to the email on your account.
              </Text>

              <Text style={styles.label}>Subject</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="What's this about?"
                placeholderTextColor={COLORS.grey}
                maxLength={120}
                returnKeyType="next"
                accessibilityLabel="Subject"
              />

              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.messageInput]}
                value={message}
                onChangeText={setMessage}
                placeholder="Describe the issue or question…"
                placeholderTextColor={COLORS.grey}
                multiline
                textAlignVertical="top"
                maxLength={5000}
                accessibilityLabel="Message"
              />

              {error ? (
                <View style={styles.errorBanner} accessibilityLiveRegion="polite" accessibilityRole="alert">
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.sendBtn, (!canSubmit || sending) && styles.btnDisabled]}
                onPress={handleSend}
                disabled={!canSubmit || sending}
                accessibilityLabel="Send message"
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmit || sending, busy: sending }}
              >
                {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendBtnText}>Send Message</Text>}
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  scroll: { padding: 20, paddingBottom: 40 },
  body: { fontSize: 14, color: COLORS.grey, lineHeight: 20, marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.grey, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 16,
  },
  messageInput: { minHeight: 140 },
  errorBanner: {
    backgroundColor: '#FDEDEC',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, color: COLORS.error },
  sendBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  sendBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  successBox: { alignItems: 'center', paddingVertical: 40 },
  successTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  successBody: { fontSize: 14, color: COLORS.grey, textAlign: 'center', lineHeight: 20, marginBottom: 28, paddingHorizontal: 20 },
  doneBtn: { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 32 },
  doneBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
