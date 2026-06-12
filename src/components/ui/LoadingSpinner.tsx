import React from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';

interface LoadingSpinnerProps {
  /** Optional message displayed below the spinner */
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  /** When true, fills the available space (use at screen level).
   *  When false, renders inline without flex: 1. */
  fullScreen?: boolean;
}

/**
 * Centered activity indicator with an optional status message.
 * Pass fullScreen for page-level loading states.
 */
export default function LoadingSpinner({
  message,
  size = 'large',
  color = '#ff6b35',
  fullScreen = true,
}: LoadingSpinnerProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0a0a0a',
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: 12,
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
});
