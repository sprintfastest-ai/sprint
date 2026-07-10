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
import { requestPasswordReset } from '@/api/auth.api';
import type { AuthStackParamList } from '@/navigation/types';
import { COLORS, FONT, RADIUS, SPACING } from '@/utils/tokens';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavProp>();

  const [email, setEmail]       = useState('');
  const [isLoading, setLoading] = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [focused, setFocused]   = useState(false);

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
          {/* Branding block — 213px, matches Login layout */}
          <View style={styles.brandingBlock}>
            <View style={styles.wordmarkRow}>
              <Text style={styles.bolt}>⚡</Text>
              <Text style={styles.wordmark}>SprintFastest</Text>
            </View>
            <View style={styles.accentLine} />
            <Text style={styles.tagline}>Your AI Sprint Coach</Text>
          </View>

          {/* Form */}
          <View style={styles.formArea}>
            {sent ? (
              /* ── Success state ── */
              <View
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
              >
                <View style={styles.successBanner}>
                  <Ionicons name="mail" size={24} color="#1A6BB5" style={styles.successBannerIcon} />
                  <View style={styles.successBannerText}>
                    <Text style={styles.successBannerTitle}>Check your email</Text>
                    <Text style={styles.successBannerBody}>
                      We sent a reset link to{' '}
                      <Text style={styles.successEmail}>{email || 'your email'}</Text>
                      . It expires in 30 minutes.
                    </Text>
                  </View>
                </View>

                <Text style={styles.hint}>
                  Didn't receive it? Check your spam folder or tap below to resend.
                </Text>

                <TouchableOpacity
                  style={styles.resendBtn}
                  onPress={() => { setSent(false); }}
                  accessibilityLabel="Resend email"
                  accessibilityRole="button"
                >
                  <Text style={styles.resendBtnText}>Resend Email</Text>
                </TouchableOpacity>

                <View style={styles.loginRow}>
                  <Text style={styles.loginPrompt}>Remember your password? </Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login')}
                    accessibilityLabel="Go to login"
                    accessibilityRole="button"
                  >
                    <Text style={styles.loginLink}>Log In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* ── Form state ── */
              <>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.body}>
                  Enter your email address and we'll send you a link to reset your password.
                </Text>

                <Text style={[styles.label, focused && styles.labelFocused]}>
                  Email address
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    focused && styles.inputFocused,
                    error ? styles.inputError : null,
                  ]}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setError(null); }}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.inputPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  returnKeyType="send"
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
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

                <View style={styles.loginRow}>
                  <Text style={styles.loginPrompt}>Remember your password? </Text>
                  <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    accessibilityLabel="Go back to login"
                    accessibilityRole="button"
                  >
                    <Text style={styles.loginLink}>Log In</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },

  // Branding block — 213px tall, matches Login
  brandingBlock: {
    height: 213,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  bolt: { fontSize: 28 },
  wordmark: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.8,
  },
  accentLine: {
    width: 220,
    height: 2,
    backgroundColor: COLORS.orange,
    borderRadius: 2,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },

  // Form area
  formArea: { paddingHorizontal: 20 },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    lineHeight: 29,
  },
  body: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 24,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  labelFocused: { color: COLORS.primary },
  input: {
    height: 48,
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.btn,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  inputError: { borderColor: COLORS.error },
  fieldError: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    marginLeft: 2,
  },

  submitBtn: {
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.5 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPrompt: { fontSize: 14, color: COLORS.textSecondary },
  loginLink: { fontSize: 14, fontWeight: '600', color: COLORS.primary },

  // Success banner — orange style matching Figma
  successBanner: {
    backgroundColor: COLORS.orangeLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.orange,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 28,
  },
  successBannerIcon: { fontSize: 24, lineHeight: 28 },
  successBannerText: { flex: 1 },
  successBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  successBannerBody: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  successEmail: { fontWeight: '600', color: COLORS.textPrimary },

  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
  },

  resendBtn: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  resendBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.primary },
});
