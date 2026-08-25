import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getPasswordCriteria } from '@/utils/passwordStrength';
import { COLORS } from '@/utils/tokens';

/**
 * Live checklist of password-strength criteria, updating as the user types
 * rather than only surfacing a "you got it wrong" error after they submit.
 * Makes it immediately visible which specific requirement isn't met yet —
 * including for a password that visually looks fine to the person typing
 * it but is missing something (a stray character, autocorrect swap, etc.).
 */
export default function PasswordStrengthChecklist({ password }: { password: string }) {
  if (!password) return null;

  return (
    <View style={styles.container} accessibilityLiveRegion="polite">
      {getPasswordCriteria(password).map((c) => (
        <View key={c.key} style={styles.row}>
          <Ionicons
            name={c.met ? 'checkmark-circle' : 'ellipse-outline'}
            size={14}
            color={c.met ? COLORS.green : COLORS.textSecondary}
          />
          <Text style={[styles.text, c.met && styles.textMet]}>{c.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: -4,
    marginBottom: 10,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  textMet: {
    color: COLORS.green,
    fontWeight: '600',
  },
});
