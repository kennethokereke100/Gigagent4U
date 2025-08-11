import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PickLocationSheet } from './picklocation';

const BG = '#F5F3F0';

export default function LocationSearch() {
  const { role } = useLocalSearchParams<{ role?: 'Talent' | 'Promoter' }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chosenCity, setChosenCity] = useState<string | null>(null);

  const title = useMemo(() => {
    if (role === 'Talent') return "Where will you be performing?";
    if (role === 'Promoter') return "Where are you promoting?";
    return "Where are we going?";
  }, [role]);

  const goToEventList = () => router.replace('/screen/eventlist');
  const goToConfirm = (city: string) => router.push({ pathname: '/screen/locationconfirm', params: { city } });

  const onCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        goToEventList();
        return;
      }
      await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLoading(false);
      // If you want, you can reverse-geocode and then call goToConfirm(city)
      goToEventList();
    } catch {
      setLoading(false);
      goToEventList();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 16 }]}>
      {/* Skip */}
      <View style={styles.topBar}>
        <View />
        <Pressable onPress={goToEventList} hitSlop={12}><Text style={styles.skip}>Skip</Text></Pressable>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        {/* Image placeholder card */}
        <View style={styles.card}>
          <View style={styles.cardPlaceholder}>
            <Text style={styles.cardPlaceholderText}>
              {chosenCity ? chosenCity : 'Image placeholder'}
            </Text>
          </View>

          {/* Floating search pill */}
          <View style={styles.searchPill}>
            <Ionicons name="location-sharp" size={18} color="#111" />
            <Text style={styles.searchPillText}>{chosenCity ?? 'San Francisco'}</Text>
          </View>
        </View>

        {/* CTAs */}
        <Pressable onPress={onCurrentLocation} style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Ionicons name="compass-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryText}>Current location</Text>
            </>
          )}
        </Pressable>

        <Pressable onPress={() => setPickerOpen(true)} style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}>
          <Text style={styles.secondaryText}>Somewhere else</Text>
        </Pressable>
      </View>

      <PickLocationSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onDone={(city) => {
          if (city) {
            setChosenCity(city);
            setPickerOpen(false);
            // Pass only the city portion before the comma
            const cityOnly = city.split(',')[0].trim();
            goToConfirm(cityOnly);
          } else {
            setPickerOpen(false);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  topBar: {
    height: 44,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skip: { fontSize: 16, fontWeight: '600', color: '#111' },

  content: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 24 },

  title: { fontSize: 28, fontWeight: '800', color: '#111', letterSpacing: 0.2, marginBottom: 4 },

  card: {
    alignSelf: 'stretch',
    aspectRatio: 16 / 10,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EDEBE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlaceholder: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  cardPlaceholderText: { color: '#9CA3AF' },

  searchPill: {
    position: 'absolute',
    bottom: -28,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 10,
  },
  searchPillText: { fontSize: 20, fontWeight: '600', color: '#111' },

  primary: {
    marginTop: 48,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primaryPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  secondary: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#DADADA',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  secondaryPressed: { opacity: 0.9 },
  secondaryText: { color: '#111', fontWeight: '700', fontSize: 16 },
});
