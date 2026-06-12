import React from 'react';
import {
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type ReactNode,
} from 'react-native';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Removes the default horizontal/vertical padding */
  noPadding?: boolean;
}

/**
 * White-on-dark card container with rounded corners and a subtle shadow.
 * Used as a layout wrapper for dashboard tiles, drill cards, etc.
 */
export default function Card({ children, style, noPadding = false }: CardProps) {
  return (
    <View style={[styles.card, noPadding ? styles.noPadding : null, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    // Android elevation
    elevation: 4,
  },
  noPadding: {
    padding: 0,
  },
});
