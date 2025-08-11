// Full-screen takeover location picker (no route; used as a controlled sheet)

import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Keyboard,
    KeyboardEvent,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const POPULAR = [
  'New York City, New York',
  'Los Angeles, California',
  'Washington, District of Columbia',
  'Chicago, Illinois',
  'Miami, Florida',
];

// Local mock index (swap with API later)
const LOCAL_INDEX = [
  'San Francisco, California',
  'San Jose, California',
  'San Diego, California',
  'Austin, Texas',
  'Seattle, Washington',
  'Portland, Oregon',
  'Atlanta, Georgia',
  'Boston, Massachusetts',
  'Dallas, Texas',
  'Houston, Texas',
  'Phoenix, Arizona',
  'Philadelphia, Pennsylvania',
  ...POPULAR,
];

async function fetchCities(query: string): Promise<string[]> {
  await new Promise((r) => setTimeout(r, 150));
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return LOCAL_INDEX.filter((c) => c.toLowerCase().includes(q)).slice(0, 50);
}

export type PickLocationSheetProps = {
  visible: boolean;
  onClose: () => void;
  onDone: (city: string | null) => void; // called only when Done is pressed
};

export function PickLocationSheet({ visible, onClose, onDone }: PickLocationSheetProps) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  const [query, setQuery] = useState('');
  const [remote, setRemote] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [kbPad, setKbPad] = useState(0);
  const inputRef = useRef<TextInput>(null);

  // Debounced search
  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await fetchCities(query);
        setRemote(results);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(id);
  }, [query, visible]);

  // Animate open/close
  useEffect(() => {
    if (visible) {
      // reset
      setQuery('');
      setRemote([]);
      setSelected(null);
      // open
      Animated.parallel([
        Animated.timing(slide, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start(() => {
        // focus after the animation
        setTimeout(() => inputRef.current?.focus(), 30);
      });
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start(() => Keyboard.dismiss());
    }
  }, [visible, slide, fade]);

  // Keyboard padding so the list never gets covered
  useEffect(() => {
    const onShow = (e: KeyboardEvent) => setKbPad((e.endCoordinates?.height ?? 0) - insets.bottom);
    const onHide = () => setKbPad(0);
    const s1 = Keyboard.addListener('keyboardWillShow', onShow);
    const s2 = Keyboard.addListener('keyboardDidShow', onShow);
    const h1 = Keyboard.addListener('keyboardWillHide', onHide);
    const h2 = Keyboard.addListener('keyboardDidHide', onHide);
    return () => { s1.remove(); s2.remove(); h1.remove(); h2.remove(); };
  }, [insets.bottom]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }); // subtle slide
  const showPopular = useMemo(() => !query.trim(), [query]);

  const handleRowPress = (city: string) => {
    setSelected((prev) => (prev === city ? null : city));
  };

  const handleDone = () => {
    onDone(selected ?? null);
    onClose();
  };

  const Row = ({ city }: { city: string }) => {
    const active = selected === city;
    return (
      <Pressable onPress={() => handleRowPress(city)} style={[styles.row, active && styles.rowActive]}>
        <Text style={[styles.rowText, active && styles.rowTextActive]} numberOfLines={1}>
          {city}
        </Text>
        {active ? (
          <Ionicons name="checkmark-circle" size={22} color="#111" />
        ) : (
          <Ionicons name="ellipse-outline" size={20} color="#D1D5DB" />
        )}
      </Pressable>
    );
  };

  // Results view
  const Results = () => {
    if (showPopular) {
      return (
        <>
          <Text style={styles.sectionTitle}>Popular locations</Text>
          {POPULAR.map((c) => <Row key={c} city={c} />)}
        </>
      );
    }
    if (loading) return <Text style={styles.helper}>Searching…</Text>;
    if (remote.length === 0) return <Text style={styles.helper}>Sorry, no locations.</Text>;
    return <>{remote.map((c) => <Row key={c} city={c} />)}</>;
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fade }]}>
        {/* Backdrop tap closes */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* TAKEOVER panel */}
        <Animated.View
          style={[
            styles.takeover,
            {
              transform: [{ translateY }],
              paddingTop: insets.top + 10,
              paddingBottom: (insets.bottom || 12) + kbPad,
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Search for a location</Text>
            <Pressable onPress={handleDone} disabled={!selected} hitSlop={10}>
              <Text style={[styles.done, !selected && { opacity: 0.35 }]}>Done</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#6B7280" style={{ marginRight: 8 }} />
            <TextInput
              ref={inputRef}
              placeholder="Try Los Angeles, California..."
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>

          {/* Results (scrolls, never hidden by keyboard due to kbPad) */}
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Results />
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  backdrop: { flex: 1 },

  // Full-screen takeover (rounded only at top to match OS sheet style)
  takeover: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '92%',
    paddingHorizontal: 16,
  },

  handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: '#D1D5DB', marginBottom: 10 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  done: { fontSize: 16, fontWeight: '700', color: '#111' },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#111' },

  sectionTitle: { marginTop: 8, marginBottom: 6, fontSize: 14, fontWeight: '700', color: '#111' },

  row: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowActive: { backgroundColor: '#F7F7F7' },
  rowText: { fontSize: 16, color: '#111' },
  rowTextActive: { fontWeight: '700' },

  helper: { paddingVertical: 18, color: '#6B7280' },
});
