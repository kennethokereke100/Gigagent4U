import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

export default function LocationSearch() {
  // Optional: pass ?role=Talent or ?role=Promoter when routing here
  const { role } = useLocalSearchParams<{ role?: 'Talent' | 'Promoter' }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const title = useMemo(() => {
    if (role === 'Talent') return "Where will you be performing?";
    if (role === 'Promoter') return "Where are you promoting?";
    return "Choose your location";
  }, [role]);

  const onCurrentLocation = async () => {
    try {
      setLoading(true);

      // Ask permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLoading(false);
        // silently return; you might show a toast/snackbar in future
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // TODO: send lat/long to your backend or next screen
      // For now, navigate onward or keep user here
      // router.push('/screen/picklocation'); // if that's your next step

      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        {/* Image placeholder card */}
        <View style={styles.card}>
          {/* Replace this placeholder with an Image later */}
          {/* <Image source={{ uri: '...' }} style={styles.cardImage} /> */}
          <View style={styles.cardPlaceholder}>
            <Text style={styles.cardPlaceholderText}>Image placeholder</Text>
          </View>

          {/* Floating search pill (non-interactive for now) */}
          <View style={styles.searchPill}>
            <Ionicons name="location-sharp" size={18} color="#111" />
            <Text style={styles.searchPillText}>San Francisco</Text>
          </View>
        </View>

        {/* CTA buttons */}
        <Pressable
          onPress={onCurrentLocation}
          style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
          android_ripple={{ color: 'rgba(255,255,255,0.08)', borderless: false }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="compass-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.primaryText}>Current location</Text>
            </>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/screen/picklocation')}
          style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
          android_ripple={{ color: 'rgba(0,0,0,0.06)', borderless: false }}
        >
          <Text style={styles.secondaryText}>Somewhere else</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { flex: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 20 },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111',
    letterSpacing: 0.2,
    marginBottom: 4,
  },

  card: {
    alignSelf: 'stretch',
    aspectRatio: 4 / 5,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EDEBE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImage: { width: '100%', height: '100%' },
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
