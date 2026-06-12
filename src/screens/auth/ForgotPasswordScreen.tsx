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
import { useNavigation } from '@react-navigation/native';
import { requestPasswordReset } from '@/api/auth.api';
import { COLORS, FONT, RADIUS, SPACING } from '@/utils/tokens';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  const [email, setEmail]       = useState('');
  const [isLoading, setLoading] = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email.trim() || !email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
    } catch {
      // Server always returns 200 whether or not the email exists — swallow.
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Go back to login"
            accessibilityRole="button"
          >
            <Text style={styles.backText}>← Log In</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            {sent ? (
              <View
                style={styles.successContainer}
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
              >
                <Text style={styles.successIcon}>✉️</Text>
                <Text style={styles.successTitle}>Check your email</Text>
                <Text style={styles.successBody}>
                  If an account exists for{' '}
                  <Text style={styles.successEmail}>{email}</Text>, you'll
                  receive a reset link within a few minutes.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.goBack()}
                  style={styles.backToLoginBtn}
                  accessibilityLabel="Back to login"
                  accessibilityRole="button"
                >
                  <Text style={styles.backToLoginText}>Back to Log In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.body}>
                  Enter your email address and we'll send you a link to reset
                  your password.
                </Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, error ? styles.inputError : null]}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(null); }}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.inputPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="send"
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel="Email address for password reset"
                />
                {error ? <Text style={styles.fieldError}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.submitBtn, isLoading && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  accessibilityLabel="Send password reset link"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isLoading, busy: isLoading }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  backBtn: { marginBottom: SPACING.md },
  backText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },

  title: { ...FONT.h2, color: COLORS.textPrimary, marginBottom: SPACING.sm },
  body: {
    ...FONT.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 24,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputError: { borderColor: COLORS.error },
  fieldError: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    marginLeft: 2,
  },

  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  // Success state
  successContainer: { alignItems: 'center', paddingVertical: SPACING.xl },
  successIcon: { fontSize: 48, marginBottom: SPACING.md },
  successTitle: {
    ...FONT.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  successBody: {
    ...FONT.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  successEmail: { fontWeight: '700', color: COLORS.textPrimary },
  backToLoginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    paddingHorizontal: SPACING.xl,
  },
  backToLoginText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
