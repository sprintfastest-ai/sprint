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
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/hooks/useAuth';
import type { RegisterPayload } from '@/api/auth.api';
import type { AuthStackParamList } from '@/navigation/types';
import type { User } from '@/types';
import { AGE_GROUPS } from '@/utils/constants';
import { COLORS, FONT, RADIUS, SPACING } from '@/utils/tokens';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const ROLES: Array<{ value: User['role']; label: string }> = [
  { value: 'athlete', label: 'Athlete' },
  { value: 'parent',  label: 'Parent'  },
  { value: 'coach',   label: 'Coach'   },
];

const EVENTS = ['60m', '100m', '200m'] as const;
type PrimaryEvent = (typeof EVENTS)[number];

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  clubName?: string;
}

function validate(
  role: User['role'],
  fullName: string,
  email: string,
  password: string,
  confirmPassword: string,
  clubName: string,
): FieldErrors {
  const errs: FieldErrors = {};
  if (!fullName.trim()) errs.fullName = 'Full name is required.';
  if (!email.trim() || !email.includes('@')) errs.email = 'Enter a valid email address.';
  if (password.length < 8) errs.password = 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) errs.password = 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) errs.password = 'Password must contain at least one number.';
  if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
  if (role === 'coach' && !clubName.trim()) errs.clubName = 'Club or school name is required.';
  return errs;
}

export default function RegisterScreen() {
  const navigation = useNavigation<NavProp>();
  const { register, isLoading, error, clearError } = useAuth();

  // Role
  const [role, setRole] = useState<User['role']>('athlete');

  // Common fields
  const [fullName, setFullName]             = useState('');
  const [email, setEmail]                   = useState('');
  const [password, setPassword]             = useState('');
  const [confirmPassword, setConfirmPw]     = useState('');
  const [showPw, setShowPw]                 = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);

  // Athlete-specific
  const [ageGroup, setAgeGroup]             = useState<string>('');
  const [primaryEvent, setPrimaryEvent]     = useState<PrimaryEvent>('100m');
  const [trainingDays, setTrainingDays]     = useState(3);

  // Coach-specific
  const [clubName, setClubName]             = useState('');

  // Validation
  const [fieldErrors, setFieldErrors]       = useState<FieldErrors>({});

  const handleRegister = async () => {
    clearError();
    const errs = validate(role, fullName, email, password, confirmPassword, clubName);
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});

    const payload: RegisterPayload = {
      email: email.trim().toLowerCase(),
      password,
      role,
      ...(role === 'athlete' && {
        ageGroup: ageGroup || undefined,
        primaryEvent: primaryEvent,
        trainingDaysPerWeek: trainingDays,
      }),
      ...(role === 'coach' && { clubName: clubName.trim() }),
    };

    try {
      await register(payload);
    } catch {
      // error is set in store
    }
  };

  const showU11Banner = role === 'athlete' && ageGroup === 'U11';

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back link */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
            accessibilityLabel="Go back to login"
            accessibilityRole="button"
          >
            <Text style={styles.backText}>← Log In</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Create Account</Text>
          <Text style={styles.subheading}>Join thousands of sprint athletes.</Text>

          {/* ── Role selector ── */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>I am a…</Text>
            <View style={styles.pillRow} accessibilityRole="tablist">
              {ROLES.map(({ value, label }) => {
                const active = role === value;
                return (
                  <TouchableOpacity
                    key={value}
                    style={[styles.pill, active && styles.pillActive]}
                    onPress={() => setRole(value)}
                    accessibilityRole="tab"
                    accessibilityLabel={label}
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.pillText, active && styles.pillTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ── Common fields ── */}
          <View style={styles.card}>
            {/* Full name */}
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, fieldErrors.fullName ? styles.inputError : null]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Jordan Smith"
              placeholderTextColor={COLORS.inputPlaceholder}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              accessibilityLabel="Full name"
            />
            {fieldErrors.fullName ? (
              <Text style={styles.fieldError}>{fieldErrors.fullName}</Text>
            ) : null}

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, fieldErrors.email ? styles.inputError : null]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.inputPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              accessibilityLabel="Email address"
            />
            {fieldErrors.email ? (
              <Text style={styles.fieldError}>{fieldErrors.email}</Text>
            ) : null}

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordRow, fieldErrors.password ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                placeholderTextColor={COLORS.inputPlaceholder}
                secureTextEntry={!showPw}
                returnKeyType="next"
                accessibilityLabel="Password"
              />
              <TouchableOpacity
                onPress={() => setShowPw((v) => !v)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={showPw ? 'Hide password' : 'Show password'}
                accessibilityRole="button"
              >
                <Text style={styles.eyeText}>{showPw ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            {fieldErrors.password ? (
              <Text style={styles.fieldError}>{fieldErrors.password}</Text>
            ) : null}

            {/* Confirm password */}
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.passwordRow, fieldErrors.confirmPassword ? styles.inputError : null]}>
              <TextInput
                style={styles.passwordInput}
                value={confirmPassword}
                onChangeText={setConfirmPw}
                placeholder="Re-enter your password"
                placeholderTextColor={COLORS.inputPlaceholder}
                secureTextEntry={!showConfirm}
                returnKeyType="done"
                accessibilityLabel="Confirm password"
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
          </View>

          {/* ── Athlete-specific fields ── */}
          {role === 'athlete' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Athlete Details</Text>

              {/* Age group */}
              <Text style={styles.label}>Age Group</Text>
              <View style={styles.pillRow}>
                {AGE_GROUPS.map((ag) => {
                  const active = ageGroup === ag;
                  return (
                    <TouchableOpacity
                      key={ag}
                      style={[styles.agePill, active && styles.pillActive]}
                      onPress={() => setAgeGroup(ag)}
                      accessibilityLabel={ag}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.agePillText, active && styles.pillTextActive]}>
                        {ag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* U11 consent banner */}
              {showU11Banner ? (
                <View
                  style={styles.u11Banner}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="polite"
                >
                  <Text style={styles.u11BannerText}>
                    ℹ️ A parent account will need to be linked before you can access training. You'll receive a link code after signing up.
                  </Text>
                </View>
              ) : null}

              {/* Primary event */}
              <Text style={[styles.label, { marginTop: SPACING.md }]}>Primary Event</Text>
              <View style={styles.pillRow}>
                {EVENTS.map((ev) => {
                  const active = primaryEvent === ev;
                  return (
                    <TouchableOpacity
                      key={ev}
                      style={[styles.agePill, active && styles.pillActive]}
                      onPress={() => setPrimaryEvent(ev)}
                      accessibilityLabel={ev}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                    >
                      <Text style={[styles.agePillText, active && styles.pillTextActive]}>
                        {ev}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Training days stepper */}
              <Text style={[styles.label, { marginTop: SPACING.md }]}>Training Days per Week</Text>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepperBtn, trainingDays <= 1 && styles.stepperBtnDisabled]}
                  onPress={() => setTrainingDays((d) => Math.max(1, d - 1))}
                  disabled={trainingDays <= 1}
                  accessibilityLabel="Decrease training days"
                  accessibilityRole="button"
                >
                  <Text style={styles.stepperBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.stepperValue} accessibilityLabel={`${trainingDays} days`}>
                  {trainingDays}
                </Text>
                <TouchableOpacity
                  style={[styles.stepperBtn, trainingDays >= 7 && styles.stepperBtnDisabled]}
                  onPress={() => setTrainingDays((d) => Math.min(7, d + 1))}
                  disabled={trainingDays >= 7}
                  accessibilityLabel="Increase training days"
                  accessibilityRole="button"
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* ── Coach-specific fields ── */}
          {role === 'coach' ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Coach Details</Text>
              <Text style={styles.label}>Club or School Name</Text>
              <TextInput
                style={[styles.input, fieldErrors.clubName ? styles.inputError : null]}
                value={clubName}
                onChangeText={setClubName}
                placeholder="e.g. City Athletics Club"
                placeholderTextColor={COLORS.inputPlaceholder}
                autoCapitalize="words"
                returnKeyType="done"
                accessibilityLabel="Club or school name"
              />
              {fieldErrors.clubName ? (
                <Text style={styles.fieldError}>{fieldErrors.clubName}</Text>
              ) : null}
            </View>
          ) : null}

          {/* API-level error */}
          {error ? (
            <View style={styles.errorBanner} accessibilityLiveRegion="polite">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Create Account CTA — #F05A1A orange per Figma */}
          <TouchableOpacity
            style={[styles.createBtn, isLoading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            accessibilityLabel="Create your SprintFastest account"
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createBtnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityLabel="Go to login"
              accessibilityRole="link"
            >
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  // ── Back ──────────────────────────────────────────────────────────────────
  backBtn: {
    marginBottom: SPACING.md,
  },
  backText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ── Heading ───────────────────────────────────────────────────────────────
  heading: {
    ...FONT.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subheading: {
    ...FONT.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },

  // ── Section label (above role pills) ────────────────────────────────────────
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },

  // ── Pills (role selector + age group + primary event) ────────────────────────
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  // Selected pill — #1A6BB5 bg, white text (confirmed by Figma)
  pillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  pillTextActive: {
    color: '#fff',
  },

  // ── Age / event pills (slightly smaller, don't flex: 1) ──────────────────────
  agePill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.pill,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  agePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    ...FONT.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  // ── Field label ───────────────────────────────────────────────────────────
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.xs,
  },

  // ── Text inputs ────────────────────────────────────────────────────────────
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
  },
  eyeText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  fieldError: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: -4,
    marginBottom: SPACING.sm,
    marginLeft: 2,
  },

  // ── U11 banner — #FEF3EC bg, #F05A1A left border ─────────────────────────────
  u11Banner: {
    backgroundColor: COLORS.bannerBg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.bannerBorder,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  u11BannerText: {
    fontSize: 13,
    color: '#7A3B0E',
    lineHeight: 19,
  },

  // ── Stepper — #1A6BB5 circle buttons per Figma ───────────────────────────────
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,  // #1A6BB5
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDisabled: {
    opacity: 0.35,
  },
  stepperBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    minWidth: 28,
    textAlign: 'center',
  },

  // ── API error banner ─────────────────────────────────────────────────────────
  errorBanner: {
    backgroundColor: '#FDEDEC',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.error,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.error,
  },

  // ── Create Account button — #F05A1A orange per Figma ─────────────────────────
  createBtn: {
    backgroundColor: COLORS.orange,   // #F05A1A
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: SPACING.md,
    minHeight: 52,
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Login row ──────────────────────────────────────────────────────────────
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  loginPrompt: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
