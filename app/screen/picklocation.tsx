import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

export default function PickLocation() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.title}>Pick a location</Text>
      <Text style={styles.sub}>This screen is coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, paddingHorizontal: 20, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: '#111', marginBottom: 8 },
  sub: { fontSize: 16, color: '#6B7280' },
});
