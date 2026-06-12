import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  /** Passed to TouchableOpacity testID for testing */
  testID?: string;
}

/**
 * Design-system button with four variants and a loading state.
 *
 * primary  — orange fill (call to action)
 * secondary — dark fill (secondary actions)
 * outline  — transparent with orange border
 * danger   — dark fill with red label (destructive actions)
 */
export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#ff6b35' : '#fff'}
        />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`], textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  // ── variant fills ──────────────────────────────────────────────────────────
  primary: {
    backgroundColor: '#ff6b35',
  },
  secondary: {
    backgroundColor: '#1e1e1e',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#ff6b35',
  },
  danger: {
    backgroundColor: '#1e1e1e',
  },
  // ── variant labels ─────────────────────────────────────────────────────────
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryLabel: { color: '#fff' },
  secondaryLabel: { color: '#fff' },
  outlineLabel: { color: '#ff6b35' },
  dangerLabel: { color: '#ff4444' },
  // ── disabled overlay ───────────────────────────────────────────────────────
  disabled: { opacity: 0.45 },
});
