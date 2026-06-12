import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

interface AvatarProps {
  /** Full name or email — first character(s) used as initials */
  name: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Deterministically maps a name string to one of 8 accent colours so the
 * same user always gets the same colour across sessions.
 */
function colorForName(name: string): string {
  const PALETTE = [
    '#ff6b35', // orange
    '#4aa3df', // blue
    '#4caf7d', // green
    '#f5a623', // amber
    '#9b59b6', // purple
    '#e91e63', // pink
    '#00bcd4', // cyan
    '#795548', // brown
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return (parts[0]?.[0] ?? '?').toUpperCase();
  }
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

/**
 * Circular avatar showing up to two initials derived from `name`.
 * The background colour is deterministically derived from the name so the
 * same user always renders with the same colour.
 */
export default function Avatar({ name, size = 44, style }: AvatarProps) {
  const bg = colorForName(name);
  const fontSize = Math.round(size * 0.38);

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
