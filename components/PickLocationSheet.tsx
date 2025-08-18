import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type City = { id: string; name: string; region?: string };
type Props = {
  visible: boolean;
  onClose: () => void;
  onDone: (picked?: City) => void;
  title?: string;
  initial?: City | null;
};

const POPULAR: City[] = [
  { id: 'nyc', name: 'New York City', region: 'New York' },
  { id: 'la', name: 'Los Angeles', region: 'California' },
  { id: 'dc', name: 'Washington', region: 'District of Columbia' },
  { id: 'chi', name: 'Chicago', region: 'Illinois' },
  { id: 'mia', name: 'Miami', region: 'Florida' },
];

export default function PickLocationSheet({ visible, onClose, onDone, title = 'Search for a location', initial = null }: Props) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<City | null>(initial);
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setQuery('');
      Animated.parallel([
        Animated.timing(slide, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start(() => Keyboard.dismiss());
    }
  }, [visible]);

  // TODO: replace with GeoDB Cities later; for now search over POPULAR
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return POPULAR;
    const list = POPULAR.filter(c => (c.name + ' ' + (c.region ?? '')).toLowerCase().includes(q));
    return list.length ? list : [{ id: 'none', name: 'Sorry, no locations', region: undefined }];
  }, [query]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fade }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.sheet, { transform: [{ translateY }], paddingBottom: insets.bottom + 8 }]}>
          {/* grabber */}
          <View style={styles.grabber} />

          {/* Header: X + centered title + Done */}
          <View style={styles.headerRow}>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color="#111" />
            </Pressable>
            <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            <Pressable onPress={() => onDone(picked || undefined)} hitSlop={10} accessibilityRole="button">
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <Ionicons name="search" size={18} color="#6B7280" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Try Los Angeles, California..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>

          {/* List */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 12 }}
              ListHeaderComponent={<Text style={styles.sectionTitle}>Popular locations</Text>}
              renderItem={({ item }) => {
                const disabled = item.id === 'none';
                const active = picked?.id === item.id;
                return (
                  <Pressable
                    disabled={disabled}
                    onPress={() => setPicked(active ? null : item)}
                    style={styles.row}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.city, disabled && { color: '#9CA3AF' }]}>{item.name}{item.region ? `, ${item.region}` : ''}</Text>
                    </View>
                    {!disabled && (
                      <Ionicons
                        name={active ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={active ? '#111' : '#9CA3AF'}
                      />
                    )}
                  </Pressable>
                );
              }}
            />
          </KeyboardAvoidingView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  backdrop: { flex: 1 },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%', // takeover feel
  },
  grabber: { alignSelf: 'center', width: 56, height: 5, borderRadius: 3, backgroundColor: '#E5E7EB', marginTop: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#111' },
  doneText: { fontSize: 16, fontWeight: '700', color: '#111' },
  searchRow: {
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    backgroundColor: '#F9FAFB',
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#111' },
  sectionTitle: { marginHorizontal: 16, marginBottom: 8, fontSize: 14, fontWeight: '600', color: '#111' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  city: { fontSize: 16, color: '#111' },
});
