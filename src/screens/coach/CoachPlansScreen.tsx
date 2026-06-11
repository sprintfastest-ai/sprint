import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CoachPlansScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Training Plans</Text>
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
  title: { fontSize: 24, fontWeight: '800', color: '#fff' },
});
