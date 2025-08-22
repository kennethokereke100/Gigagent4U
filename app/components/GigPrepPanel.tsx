import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

type Slide = {
  id: string; // Add id for tracking dismissed cards
  title: string;
  subtitle: string;
  // future: image/icon; for now we show a big check icon
};

type Props = {
  slides: Slide[];
  completedCount: number;   // e.g., 2
  totalCount: number;       // e.g., 4
  onDismissCard?: (id: string) => void; // Callback when card is dismissed
  dismissedCards?: { [key: string]: boolean }; // Track which cards are dismissed
};

export default function GigPrepPanel({ slides, completedCount, totalCount, onDismissCard, dismissedCards = {} }: Props) {
  const [index, setIndex] = useState(0);
  const progress = Math.min(1, Math.max(0, completedCount / Math.max(1, totalCount)));

  // Filter out dismissed cards
  const visibleSlides = slides.filter(slide => !dismissedCards[slide.id]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  // If no visible slides, don't render anything
  if (visibleSlides.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Prepare for your gig search</Text>
        <Text style={styles.meterLabel}>{completedCount}/{totalCount} complete</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        contentContainerStyle={{}}
        snapToInterval={width}
        decelerationRate="fast"
      >
        {visibleSlides.map((s, i) => (
          <View key={s.id} style={[styles.slide, { width }]}>
            <View style={styles.card}>
              {/* Dismiss button */}
              {onDismissCard && (
                <Pressable 
                  style={styles.dismissButton}
                  onPress={() => onDismissCard(s.id)}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={20} color="#6B7280" />
                </Pressable>
              )}
              
              <View style={styles.badge}>
                <Ionicons name="checkmark" size={28} color="#234F1E" />
              </View>
              <Text style={styles.cardTitle}>{s.title}</Text>
              <Text style={styles.cardSub}>{s.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {visibleSlides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8, paddingBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: '#111' },
  meterLabel: { fontSize: 13, color: '#374151' },

  progressTrack: { height: 8, marginHorizontal: 16, borderRadius: 8, backgroundColor: '#E6E9EC', overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: 8, backgroundColor: '#1F7A3D' },

  slide: { paddingHorizontal: 16 },
  card: { 
    backgroundColor: '#DFF0D8', 
    borderRadius: 12, 
    padding: 20, 
    minHeight: 160, 
    justifyContent: 'center',
    position: 'relative' // For dismiss button positioning
  },
  dismissButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badge: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#CBE6C1', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 6 },
  cardSub: { fontSize: 14, color: '#111', lineHeight: 20 },

  dots: { flexDirection: 'row', alignSelf: 'center', gap: 6, marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#111' },
});
