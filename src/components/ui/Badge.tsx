import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: '#1a3d2b', text: '#4caf7d' },
  warning: { bg: '#3d2e10', text: '#f5a623' },
  danger:  { bg: '#3d1212', text: '#ff4444' },
  info:    { bg: '#0d2540', text: '#4aa3df' },
};

/**
 * Small pill badge for status labels, achievement tags, and plan types.
 */
export default function Badge({
  label,
  variant = 'info',
  style,
}: BadgeProps) {
  const { bg, text } = VARIANT_COLORS[variant];

  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
