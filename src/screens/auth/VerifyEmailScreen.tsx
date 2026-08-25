import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { verifyEmail } from '@/api/auth.api';
import type { AuthStackParamList } from '@/navigation/types';
import { COLORS, FONT, RADIUS, SPACING } from '@/utils/tokens';

type NavProp   = NativeStackNavigationProp<AuthStackParamList, 'VerifyEmail'>;
type RouteProp = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>['route'];

type Status = 'verifying' | 'success' | 'error';

/**
 * Reached via the sprintfastest://verify-email?token=<jwt> deep link sent in
 * the welcome/verification email. Sign-in isn't gated on verification (see
 * auth.service.ts's login — is_verified is tracked but never enforced), so
 * this is a confirmation step rather than something blocking anyone out —
 * an expired/invalid link just means "email marked verified" doesn't
 * happen, not that the account stops working.
 */
export default function VerifyEmailScreen() {
  const navigation = useNavigation<NavProp>();
  const route       = useRoute<RouteProp>();
  const { token }    = route.params;

  const [status, setStatus] = useState<Status>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await verifyEmail(token);
        if (!cancelled) setStatus('success');
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(
            err instanceof Error
              ? err.message
              : 'This verification link is invalid or has expired.',
          );
          setStatus('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.card}>
          {status === 'verifying' && (
            <View style={styles.center} accessibilityLiveRegion="polite">
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.verifyingText}>Verifying your email…</Text>
            </View>
          )}

          {status === 'success' && (
            <View
              style={styles.center}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              <Ionicons name="checkmark-circle" size={52} color={COLORS.green} style={styles.icon} />
              <Text style={styles.title}>Email verified</Text>
              <Text style={styles.body}>
                Your email address has been confirmed. You're all set.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.primaryBtn}
                accessibilityLabel="Go to login"
                accessibilityRole="button"
              >
                <Text style={styles.primaryBtnText}>Log In</Text>
              </TouchableOpacity>
            </View>
          )}

          {status === 'error' && (
            <View
              style={styles.center}
              accessibilityLiveRegion="polite"
              accessibilityRole="alert"
            >
              <Ionicons name="alert-circle" size={52} color={COLORS.error} style={styles.icon} />
              <Text style={styles.title}>Verification failed</Text>
              <Text style={styles.body}>{errorMessage}</Text>
              <Text style={styles.hint}>
                You can still sign in — this just confirms your email address.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.primaryBtn}
                accessibilityLabel="Go to login"
                accessibilityRole="button"
              >
                <Text style={styles.primaryBtnText}>Log In</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
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
  center: { alignItems: 'center', paddingVertical: SPACING.xl },
  verifyingText: {
    ...FONT.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  icon: { marginBottom: SPACING.md },
  title: {
    ...FONT.h2,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  body: {
    ...FONT.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.sm,
  },
  hint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.md,
  },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
