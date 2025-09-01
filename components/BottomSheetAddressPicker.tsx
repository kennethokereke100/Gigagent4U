import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useUserLocation } from '../contexts/UserLocationContext';
import { getGoogleMapsApiKey } from '../utils/getGoogleMapsApiKey';

interface AddressSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface BottomSheetAddressPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: string) => void;
}

const GOOGLE_PLACES_API_KEY = getGoogleMapsApiKey();

export default function BottomSheetAddressPicker({
  visible,
  onClose,
  onSelectAddress,
}: BottomSheetAddressPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { city, state } = useUserLocation();

  // Debug API key loading
  useEffect(() => {
    console.log('🔑 Google Places API Key loaded:', !!GOOGLE_PLACES_API_KEY);
    console.log('📍 Current event location:', city && state ? `${city}, ${state}` : 'Not set');
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn('⚠️ Google Places API key not found. Check your .env file.');
    }
  }, [city, state]);

  // Debounce search query (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  // Geocode event location to lat/lng coordinates
  const geocodeEventLocation = useCallback(async (city: string, state: string) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        `${city}, ${state}, USA`
      )}&key=${GOOGLE_PLACES_API_KEY}`;

      console.log('🗺️ Geocoding event location:', `${city}, ${state}, USA`);
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        const coords = `${lat},${lng}`;
        console.log('✅ Geocoded coordinates:', coords);
        return coords;
      }
      console.warn("⚠️ Geocoding failed for event location:", data.status);
    } catch (err) {
      console.error("❌ Error geocoding event location:", err);
    }
    return null;
  }, []);

  // Refined location bias function with proper priority order
  const getLocationBias = useCallback(async () => {
    // Priority 1: Event location (geocode city/state to lat/lng)
    if (city && state) {
      console.log("🎯 Using event location for bias:", `${city}, ${state}`);
      const coords = await geocodeEventLocation(city, state);
      if (coords) return coords;
    }

    // Priority 2: Device location using Google Maps Geolocation API
    const deviceLocation = await getDeviceLocation();
    if (deviceLocation) {
      const coords = `${deviceLocation.lat},${deviceLocation.lng}`;
      console.log('📍 Using device location bias:', coords);
      return coords;
    }

    // Priority 3: Fallback → US-wide search (no lat/lng bias, just restrict to US)
    console.log("🇺🇸 Falling back to US-wide search");
    return null;
  }, [city, state, geocodeEventLocation]);

  // Optimized fetchSuggestions function with refined location biasing
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }

    if (!GOOGLE_PLACES_API_KEY) {
      console.error('❌ Google Places API key not available');
      Alert.alert('Error', 'Google Places API key not configured. Please check your environment variables.');
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const locationBias = await getLocationBias();
      
      // Build URL with appropriate parameters - always restrict to US
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?` +
        `input=${encodeURIComponent(query)}` +
        `&key=${GOOGLE_PLACES_API_KEY}` +
        `&types=geocode` + // includes addresses, cities, venues, landmarks
        `&components=country:us`; // always restrict to US

      // Add location bias if available
      if (locationBias) {
        url += `&location=${locationBias}&radius=50000`; // ~50km bias
      }

      console.log('🔍 Fetching suggestions for:', query);
      console.log('🎯 Location bias:', locationBias || 'US-wide search');
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        console.log('✅ Found', data.predictions?.length || 0, 'suggestions');
        setSuggestions(data.predictions || []);
      } else if (data.status === 'ZERO_RESULTS') {
        console.log('📭 No results found for:', query);
        setSuggestions([]);
      } else {
        console.error('❌ Google Places API error:', data.status, data.error_message);
        // Don't show alert for API errors, just log them
        setSuggestions([]);
      }
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [getLocationBias]);

  // Fetch suggestions when debounced query changes
  useEffect(() => {
    fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions]);

  const handleSelectAddress = (suggestion: AddressSuggestion) => {
    console.log('📍 Selected address:', suggestion.description);
    onSelectAddress(suggestion.description);
    onClose();
    setSearchQuery('');
    setSuggestions([]);
  };

  const renderSuggestion = ({ item }: { item: AddressSuggestion }) => (
    <Pressable
      style={styles.suggestionItem}
      onPress={() => handleSelectAddress(item)}
    >
      <Ionicons name="location" size={20} color="#6B7280" style={styles.suggestionIcon} />
      <View style={styles.suggestionText}>
        <Text style={styles.suggestionMainText}>
          {item.structured_formatting.main_text}
        </Text>
        <Text style={styles.suggestionSecondaryText}>
          {item.structured_formatting.secondary_text}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : searchQuery.length > 0 ? (
        <Text style={styles.emptyStateText}>No addresses found</Text>
      ) : (
        <Text style={styles.emptyStateText}>Start typing to search addresses</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>Cancel</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Select Address</Text>
            <View style={{ width: 60 }} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#6B7280" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search address"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {loading && <ActivityIndicator size="small" color="#007AFF" />}
            </View>
          </View>

          {/* Suggestions List */}
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.place_id}
            style={styles.suggestionsList}
            contentContainerStyle={styles.suggestionsContent}
            ListEmptyComponent={renderEmptyState}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionsContent: {
    paddingHorizontal: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionMainText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
    marginBottom: 2,
  },
  suggestionSecondaryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});
