import React from 'react';
import { View, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

interface ErrorMessageProps {
  message: string | null | undefined;
  style?: StyleProp<ViewStyle>;
}

/**
 * Inline error message with a warning icon prefix.
 * Renders nothing when `message` is falsy — safe to render unconditionally.
 */
export default function ErrorMessage({ message, style }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>⚠</Text>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#3d121240',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  icon: {
    color: '#ff4444',
    fontSize: 14,
    lineHeight: 20,
  },
  text: {
    flex: 1,
    color: '#ff8080',
    fontSize: 14,
    lineHeight: 20,
  },
});
