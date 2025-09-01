import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

export default function LocationConfirm() {
  const { city } = useLocalSearchParams<{ city?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const titleCity = (city ?? 'Your city').trim();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      {/* back */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#111" />
        </Pressable>
        <View />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {`Nice, ${titleCity} is\ngreat.`}
        </Text>

        {/* Map/photos placeholder */}
        <View style={styles.mapCard}>
          <Text style={styles.mapCardText}>Map / collage placeholder</Text>
        </View>

        <Pressable
          onPress={() => router.replace('/screen/Eventlist')}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topBar: {
    height: 40,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  content: { flex: 1, paddingHorizontal: 20, gap: 24 },
  title: { fontSize: 32, fontWeight: '800', color: '#111', lineHeight: 38 },

  mapCard: {
    alignSelf: 'stretch',
    borderRadius: 24,
    backgroundColor: '#ECEBE8',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCardText: { color: '#9CA3AF' },

  cta: {
    marginTop: 'auto',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
