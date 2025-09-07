import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PickLocationSheet from '../../components/PickLocationSheet';
import { useUserLocation } from '../../contexts/UserLocationContext';
import { useUserRole } from '../../contexts/UserRoleContext';
import { getGoogleMapsApiKey } from '../../utils/getGoogleMapsApiKey';

const BG = '#F5F3F0';

export default function LocationSearch() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useUserRole();
  const { setLocation } = useUserLocation();
  const [loading, setLoading] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [chosenCity, setChosenCity] = useState<string | null>(null);

  const title = useMemo(() => {
    if (role === 'talent') return "Where will you be performing?";
    if (role === 'promoter') return "Where are you promoting?";
    return "Where are we going?";
  }, [role]);

  const goToEventList = () => router.replace('/screen/eventlist');
  const goToConfirm = (city: string, state: string) => router.push({ 
    pathname: '/screen/Locationconfirm', 
    params: { city, state } 
  });

  // Get device location using Google Maps Geolocation API
  const getDeviceLocation = async () => {
    try {
      const apiKey = getGoogleMapsApiKey();
      if (!apiKey) {
        console.error('❌ Google Maps API key not available');
        return null;
      }

      // Get device location using Google's Geolocation API
      const response = await fetch(
        `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            considerIp: true, // Use IP-based location as fallback
          }),
        }
      );

      const data = await response.json();
      
      if (data.location) {
        console.log('📍 Device location obtained:', data.location);
        return data.location;
      } else {
        console.error('❌ Geolocation API error:', data.error);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting device location:', error);
      return null;
    }
  };

  // Convert coordinates to city/state with fallbacks
  const getCityStateWithFallback = async (lat: number, lng: number) => {
    try {
      // Step 1: Try Google Geocoding API
      const apiKey = getGoogleMapsApiKey();
      if (apiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&components=country:us`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
          const addressComponents = data.results[0].address_components;
          let city = '';
          let state = '';
          for (const comp of addressComponents) {
            if (comp.types.includes('locality')) city = comp.long_name;
            if (comp.types.includes('administrative_area_level_1')) state = comp.short_name;
          }
          if (city && state) {
            console.log('✅ Google resolved city/state:', city, state);
            return { city, state };
          }
        }
      }

      // Step 2: Fallback to Expo reverse geocoding
      const reverse = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (reverse.length > 0) {
        const { city, region } = reverse[0];
        if (city && region) {
          console.log('✅ Expo reverse geocode resolved city/state:', city, region);
          return { city, state: region };
        }
      }

      // Step 3: Hardcode fallback
      console.warn('⚠️ Falling back to Baltimore, Maryland');
      return { city: 'Baltimore', state: 'MD' };

    } catch (error) {
      console.error('❌ Error resolving city/state:', error);
      return { city: 'Baltimore', state: 'MD' };
    }
  };

  const onCurrentLocation = async () => {
    try {
      setLoading(true);
      console.log('🔍 Getting current location...');
      
      // Step 1: Get device coordinates
      const location = await getDeviceLocation();
      if (!location) {
        console.log('❌ Could not get device location');
        setLoading(false);
        goToEventList();
        return;
      }
      
      // Step 2: Convert coordinates to city/state (will always return valid city/state or Baltimore fallback)
      const cityState = await getCityStateWithFallback(location.lat, location.lng);
      
      // Step 3: Save to context and navigate
      const cityStateString = `${cityState.city}, ${cityState.state}`;
      setLocation(cityState.city, cityState.state);
      setChosenCity(cityStateString);
      setLoading(false);
      
      console.log('✅ Location resolved and saved:', cityStateString);
      goToConfirm(cityState.city, cityState.state);
      
    } catch (error) {
      console.error('❌ Location error:', error);
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
        onDone={(picked) => {
          if (picked) {
            // Parse city and state from picked location
            const locationParts = picked.name.split(', ');
            const city = locationParts[0] || picked.name;
            const state = locationParts[1] || '';
            
            // Save to global context
            setLocation(city, state);
            setChosenCity(picked.name);
            setPickerOpen(false);
            goToConfirm(city, state);
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
