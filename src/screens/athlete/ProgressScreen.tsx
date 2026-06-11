import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProgressScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Progress</Text>
      <Text style={styles.sub}>Personal bests and session history.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  sub: { fontSize: 14, color: '#888' },
});
