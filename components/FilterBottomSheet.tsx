import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DistanceSlider from './DistanceSlider';

// sizes
const { height: SCREEN_H, width: SCREEN_W } = Dimensions.get('window');
const SHEET_H = Math.round(SCREEN_H * 0.95);

const BG = '#F5F3F0';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111';
const MUTED = '#6B7280';

type TimeBucket = 'now' | '24h' | '1d' | '1w' | '1m' | '1m_plus';

type Filters = {
  categories: string[];
  time?: TimeBucket;
  maxMiles?: number;
};

type Props = {
  visible: boolean;
  value: Filters;
  resultCount: number;
  onChange: (next: Filters) => void;
  onApply: (next: Filters) => void;
  onClose: () => void;
};

const CATEGORY_OPTIONS = ['Wrestlers','Boxers','Comedians','Referees','Ring Announcers','Coaches'];

export default function FilterBottomSheet({
  visible, value, resultCount, onChange, onApply, onClose
}: Props) {
  const insets = useSafeAreaInsets();
  const [local, setLocal] = useState<Filters>(value);

  useEffect(() => { if (visible) setLocal(value); }, [visible, value]);

  // ---- sheet animation ----
  const slide = useRef(new Animated.Value(0)).current; // 0 hidden, 1 shown
  useEffect(() => {
    Animated.timing(slide, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [visible]);
  const sheetY = slide.interpolate({
    inputRange: [0,1],
    outputRange: [SCREEN_H, SCREEN_H - SHEET_H] // slides up to 95% height
  });

  // ---- chips helpers ----
  const toggleCat = (c: string) => {
    const next = {
      ...local,
      categories: local.categories.includes(c)
        ? local.categories.filter(x => x !== c)
        : [...local.categories, c]
    };
    setLocal(next);
    onChange?.(next);
  };

  const setTime = (t?: TimeBucket) => {
    const next = { ...local, time: t };
    setLocal(next);
    onChange?.(next);
  };

  const selectedCount =
    (local.categories?.length || 0) + (local.time ? 1 : 0) + (local.maxMiles !== 50 ? 1 : 0);

  // when applying filters, include miles
  const handleApply = () => onApply({ ...local, maxMiles: local.maxMiles });

  // when clearing, reset miles to 50 and thumb to center
  const handleClear = () => {
    const cleared = { categories: [], time: undefined, maxMiles: 50 };
    setLocal(cleared);
    onChange(cleared);
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: slide }]}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View style={[styles.sheet, { height: SHEET_H, transform: [{ translateY: sheetY }] }]}>
          {/* Header - stays visible */}
          <View style={styles.header}>
            <Pressable hitSlop={10} onPress={onClose}>
              <Ionicons name="close" size={22} color={TEXT} />
            </Pressable>
            <Text style={styles.headerTitle}>Filter</Text>
            <Pressable hitSlop={10} onPress={handleApply}>
              <Text style={styles.doneBtn}>Done</Text>
            </Pressable>
          </View>

          {/* Scrollable content */}
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingHorizontal: 16, 
              paddingBottom: insets.bottom + 32,
              gap: 12,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Category */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Category</Text>
              <View style={styles.chipsRow}>
                {CATEGORY_OPTIONS.map(c => {
                  const active = local.categories?.includes(c);
                  return (
                    <Pressable key={c} onPress={() => toggleCat(c)}
                      style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Time posted */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Time posted</Text>
              <View style={styles.chipsRow}>
                {[
                  ['now','Just now'],
                  ['24h','Last 24 hours'],
                  ['1d','1+ days'],
                  ['1w','1 week'],
                  ['1m','1 month'],
                  ['1m_plus','1+ months'],
                ].map(([k,label])=>{
                  const active = local.time === k;
                  return (
                    <Pressable key={k} onPress={()=> setTime(k as TimeBucket)}
                      style={[styles.chip, active && styles.chipActive]}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                    </Pressable>
                  );
                })}
                {!!local.time && (
                  <Pressable onPress={()=> setTime(undefined)} style={[styles.chip, {borderStyle:'dashed'}]}>
                    <Text style={styles.chipText}>Clear</Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* Distance */}
            <View style={styles.card}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.cardTitle}>Distance</Text>
                <Text style={styles.sectionMeta}>{Math.round(local.maxMiles ?? 50)} mi</Text>
              </View>

              <DistanceSlider
                value={local.maxMiles ?? 50}
                onChange={(m) => {
                  const next = { ...local, maxMiles: m };
                  setLocal(next);
                  onChange(next); // keep parent draft in sync
                }}
                min={0}
                max={100}
                step={1}
              />

              <View style={styles.scaleRow}>
                <Text style={styles.scaleLabel}>0</Text>
                <Text style={styles.scaleLabel}>100</Text>
              </View>
            </View>

            {/* Bottom actions */}
            <View style={styles.ctaRow}>
              <Pressable
                onPress={handleClear}
                style={[styles.btn, styles.btnGhost]}
              >
                <Text style={styles.btnGhostText}>Clear all ({selectedCount})</Text>
              </Pressable>

              <Pressable onPress={handleApply} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryText}>Show {resultCount}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  backdrop: { flex: 1 },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    height: 52,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BG,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  doneBtn: { fontSize: 16, fontWeight: '600', color: TEXT },

  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: TEXT },
  sectionMeta: { fontSize: 14, fontWeight: '600', color: TEXT },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: BORDER, backgroundColor: CARD },
  chipActive: { backgroundColor: TEXT, borderColor: TEXT },
  chipText: { color: TEXT, fontSize: 14 },
  chipTextActive: { color: CARD },

  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  scaleLabel: { fontSize: 12, color: MUTED },

  ctaRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 24,
  },
  btn: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnGhost: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  btnGhostText: { fontSize: 16, fontWeight: '600', color: TEXT },
  btnPrimary: { backgroundColor: TEXT },
  btnPrimaryText: { fontSize: 16, fontWeight: '700', color: CARD },
});
