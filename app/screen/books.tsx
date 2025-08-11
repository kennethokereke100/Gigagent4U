import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
const BG = '#F5F3F0';
export default function Books() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Books</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#111' },
});
