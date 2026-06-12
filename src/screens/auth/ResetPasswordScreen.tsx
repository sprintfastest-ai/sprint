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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { resetPassword } from '@/api/auth.api';
import type { AuthStackParamList } from '@/navigation/types';
import { COLORS, FONT, RADIUS, SPACING } from '@/utils/tokens';

type NavProp   = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type RouteProp = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>['route'];

export default function ResetPasswordScreen() {
  const navigation = useNavigation<NavProp>();
  const route      = useRoute<RouteProp>();
  const { token }  = route.params;

  const [newPassword, setNewPw]         = useState('');
  const [confirmPassword, setConfirmPw] = useState('');
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isLoading, setLoading]         = useState(false);
  const [done, setDone]                 = useState(false);
  const [fieldErrors, setFieldErrors]   = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError]         = useState<string | null>(null);

  const validate = (): boolean => {
    const errs: typeof fieldErrors = {};
    if (newPassword.length < 8)
      errs.newPassword = 'Password must be at least 8 characters.';
    else if (!/[A-Z]/.test(newPassword))
      errs.newPassword = 'Must contain at least one uppercase letter.';
    else if (!/[0-9]/.test(newPassword))
      errs.newPassword = 'Must contain at least one number.';
    if (newPassword !== confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : 'Reset failed. The link may have expired — request a new one.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Nav bar — back chevron + centred title, matches Register pattern */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navBack}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.navBackChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>New Password</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            {done ? (
              /* ── Success state ── */
              <View
                style={styles.successContainer}
                accessibilityLiveRegion="polite"
                accessibilityRole="alert"
              >
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>Password updated</Text>
                <Text style={styles.successBody}>
                  Your password has been changed. You can now log in with your
                  new password.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  style={styles.loginBtn}
                  accessibilityLabel="Go to login"
                  accessibilityRole="button"
                >
                  <Text style={styles.loginBtnText}>Log In</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.title}>New Password</Text>
                <Text style={styles.body}>
                  Choose a strong password — at least 8 characters with one
                  uppercase letter and one number.
                </Text>

                {/* New password */}
                <Text style={styles.label}>New Password</Text>
                <View
                  style={[
                    styles.passwordRow,
                    fieldErrors.newPassword ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={newPassword}
                    onChangeText={(v) => { setNewPw(v); setFieldErrors((e) => ({ ...e, newPassword: undefined })); }}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    placeholderTextColor={COLORS.inputPlaceholder}
                    secureTextEntry={!showNew}
                    autoComplete="new-password"
                    returnKeyType="next"
                    accessibilityLabel="New password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNew((v) => !v)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={showNew ? 'Hide new password' : 'Show new password'}
                    accessibilityRole="button"
                  >
                    <Text style={styles.eyeText}>{showNew ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                {fieldErrors.newPassword ? (
                  <Text style={styles.fieldError}>{fieldErrors.newPassword}</Text>
                ) : null}

                {/* Confirm password */}
                <Text style={styles.label}>Confirm Password</Text>
                <View
                  style={[
                    styles.passwordRow,
                    fieldErrors.confirmPassword ? styles.inputError : null,
                  ]}
                >
                  <TextInput
                    style={styles.passwordInput}
                    value={confirmPassword}
                    onChangeText={(v) => { setConfirmPw(v); setFieldErrors((e) => ({ ...e, confirmPassword: undefined })); }}
                    placeholder="Re-enter your new password"
                    placeholderTextColor={COLORS.inputPlaceholder}
                    secureTextEntry={!showConfirm}
                    autoComplete="new-password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    accessibilityLabel="Confirm new password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm((v) => !v)}
                    style={styles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    accessibilityRole="button"
                  >
                    <Text style={styles.eyeText}>{showConfirm ? 'Hide' : 'Show'}</Text>
                  </TouchableOpacity>
                </View>
                {fieldErrors.confirmPassword ? (
                  <Text style={styles.fieldError}>{fieldErrors.confirmPassword}</Text>
                ) : null}

                {/* API error */}
                {apiError ? (
                  <View
                    style={styles.errorBanner}
                    accessibilityLiveRegion="polite"
                    accessibilityRole="alert"
                  >
                    <Text style={styles.errorText}>{apiError}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  style={[styles.submitBtn, isLoading && styles.btnDisabled]}
                  onPress={handleSubmit}
                  disabled={isLoading}
                  accessibilityLabel="Set new password"
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isLoading, busy: isLoading }}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitBtnText}>Set New Password</Text>
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
  navBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  navBack: {
    position: 'absolute',
    left: SPACING.lg,
    padding: 4,
  },
  navBackChevron: {
    fontSize: 32,
    lineHeight: 36,
    color: COLORS.primary,
    fontWeight: '300',
  },
  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

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
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  inputError: { borderColor: COLORS.error },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  eyeBtn: { paddingHorizontal: SPACING.md, paddingVertical: 14 },
  eyeText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  fieldError: {
    fontSize: 12,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    marginLeft: 2,
  },

  errorBanner: {
    backgroundColor: '#FDEDEC',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: { fontSize: 13, color: COLORS.error },

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

  // Success
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
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    paddingHorizontal: SPACING.xl,
  },
  loginBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
