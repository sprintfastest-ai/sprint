import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
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
import type { AuthStackParamList } from '@/navigation/types';
import { COLORS, FONT, RADIUS, SPACING } from '@/utils/tokens';

type NavProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);

  const handleLogin = async () => {
    clearError();
    if (!email.trim() || !password) {
      // Guard against autofill not syncing with React state
      return;
    }
    try {
      await login(email.trim().toLowerCase(), password);
    } catch {
      // error is set in the store — rendered below
    }
  };

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
          {/* ── Wordmark ── */}
          <View style={styles.header} accessibilityRole="header">
            <Image
              source={require('@/assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
              accessibilityLabel="SprintFastest logo"
            />
            <Text style={styles.wordmark}>SprintFastest</Text>
          </View>

          <Text style={styles.tagline}>Track. Train. Dominate.</Text>

          {/* Orange accent line below tagline */}
          <View style={styles.accentLine} accessibilityElementsHidden />

          {/* ── Form card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Log In</Text>

            {/* Email */}
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={(t) => setEmail(t)}
              onChange={(e) => setEmail(e.nativeEvent.text)}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.inputPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              accessibilityLabel="Email address"
            />

            {/* Password */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.inputPlaceholder}
                secureTextEntry={!showPw}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
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

            {/* Error banner */}
            {error ? (
              <View style={styles.errorBanner} accessibilityLiveRegion="polite">
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Log In CTA */}
            <TouchableOpacity
              style={[styles.loginBtn, isLoading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              accessibilityLabel="Log in to your account"
              accessibilityRole="button"
              accessibilityState={{ disabled: isLoading, busy: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Forgot password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotBtn}
              accessibilityLabel="Forgot your password? Tap to reset it."
              accessibilityRole="link"
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Register row */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              accessibilityLabel="Register for a new SprintFastest account"
              accessibilityRole="link"
            >
              <Text style={styles.registerLink}>Register</Text>
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
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },

  // ── Wordmark ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  logoImage: {
    width: 44,
    height: 44,
  },
  wordmark: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.primary,   // #1A6BB5 confirmed by Figma
    letterSpacing: -0.5,
  },
  tagline: {
    ...FONT.caption,
    color: COLORS.textSecondary,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  // 2px × 60px orange line, centred
  accentLine: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.orange,   // #F05A1A
    borderRadius: 1,
    marginBottom: SPACING.xl,
  },

  // ── Form card ────────────────────────────────────────────────────────────────
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    ...FONT.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },

  // ── Field label ──────────────────────────────────────────────────────────────
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: SPACING.xs,
  },

  // ── Text inputs ───────────────────────────────────────────────────────────────
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
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

  // ── Error banner ─────────────────────────────────────────────────────────────
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

  // ── Log In button — #1A6BB5 per Figma ────────────────────────────────────────
  loginBtn: {
    backgroundColor: COLORS.primary,  // #1A6BB5
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.xs,
    minHeight: 52,
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // ── Forgot password ───────────────────────────────────────────────────────────
  forgotBtn: {
    marginTop: SPACING.md,
    alignSelf: 'center',
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // ── Register row — "Register" link is #F05A1A bold per Figma ──────────────────
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  registerPrompt: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.orange,   // #F05A1A
  },
});
