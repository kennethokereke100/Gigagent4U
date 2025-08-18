import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useEffect, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111';
const MUTED = '#6B7280';
const PRIMARY = '#5B2331';

type Pillar = 'Wrestling' | 'MMA' | 'Boxing' | 'Comedy' | 'Music' | 'Others';

type Filters = {
  pillars: Pillar[];
  maxDistance: number;
};

const PILLARS: Pillar[] = ['Wrestling', 'MMA', 'Boxing', 'Comedy', 'Music', 'Others'];

interface GroupFilterProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Filters) => void;
  onFiltersChange: (filters: Filters) => void;
  initialFilters?: Filters;
  resultCount: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SHEET_HEIGHT = 0.95; // 95% of screen height for more space

export default function GroupFilter({
  visible,
  onClose,
  onApply,
  onFiltersChange,
  initialFilters = { pillars: [], maxDistance: 25 },
  resultCount,
}: GroupFilterProps) {
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [slideAnim] = useState(new Animated.Value(SHEET_HEIGHT));

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Update parent component whenever filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 10;
    },
    onPanResponderMove: (_, gestureState) => {
      const newValue = Math.max(0, Math.min(SHEET_HEIGHT, gestureState.dy / 400));
      slideAnim.setValue(newValue);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const togglePillar = (pillar: Pillar) => {
    setFilters(prev => ({
      ...prev,
      pillars: prev.pillars.includes(pillar)
        ? prev.pillars.filter(p => p !== pillar)
        : [...prev.pillars, pillar],
    }));
  };

  const updateDistance = (distance: number) => {
    setFilters(prev => ({ ...prev, maxDistance: distance }));
  };

  const resetFilters = () => {
    const resetFilters = { pillars: [], maxDistance: 25 };
    setFilters(resetFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideAnim.interpolate({
                inputRange: [0, SHEET_HEIGHT],
                outputRange: [0, SCREEN_WIDTH * SHEET_HEIGHT],
              }) }],
              paddingBottom: insets.bottom,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Groups</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={TEXT} />
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Pillars Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pillars</Text>
              <View style={styles.pillarGrid}>
                {PILLARS.map(pillar => (
                  <Pressable
                    key={pillar}
                    onPress={() => togglePillar(pillar)}
                    style={[
                      styles.pillarChip,
                      filters.pillars.includes(pillar) && styles.pillarChipActive,
                    ]}
                  >
                    <Text style={[
                      styles.pillarChipText,
                      filters.pillars.includes(pillar) && styles.pillarChipTextActive,
                    ]}>
                      {pillar}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Distance Section */}
            <View style={styles.section}>
              <View style={styles.distanceHeader}>
                <Text style={styles.sectionTitle}>Distance</Text>
                <Text style={styles.distanceValue}>{Math.round(filters.maxDistance)} mi</Text>
              </View>
              <View style={styles.distanceCard}>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={1}
                    maximumValue={100}
                    step={1}
                    value={filters.maxDistance}
                    onValueChange={updateDistance}
                    minimumTrackTintColor={PRIMARY}
                    maximumTrackTintColor="#d3d3d3"
                    thumbTintColor="#ffffff"
                  />
                  <View style={styles.sliderLabels}>
                    <Text style={styles.sliderLabel}>1 mi</Text>
                    <Text style={styles.sliderLabel}>100 mi</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable onPress={resetFilters} style={styles.resetBtn}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </Pressable>
            <Pressable onPress={handleApply} style={styles.applyBtn}>
              <Text style={styles.applyBtnText}>Show results ({resultCount})</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 12,
  },
  pillarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillarChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  pillarChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  pillarChipText: {
    fontSize: 14,
    color: MUTED,
    fontWeight: '500',
  },
  pillarChipTextActive: {
    color: '#FFFFFF',
  },
  distanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  distanceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  distanceCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  sliderContainer: {
    gap: 12,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: MUTED,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  resetBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  resetBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: MUTED,
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: PRIMARY,
    alignItems: 'center',
  },
  applyBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
