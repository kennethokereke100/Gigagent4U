import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { getGoogleMapsApiKey } from '../../utils/getGoogleMapsApiKey';

const BG = '#F5F3F0';

type Location = {
  latitude: number;
  longitude: number;
};

type Place = {
  id: string;
  name: string;
  location: Location;
  type: 'restaurant' | 'stadium' | 'event';
  distance?: number;
};

type SearchResult = {
  id: string;
  name: string;
  location: Location;
  type: 'restaurant' | 'stadium' | 'event';
  distance: number;
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchSheet, setShowSearchSheet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [webViewError, setWebViewError] = useState<string | null>(null);

  // Dummy data for testing
  const dummyPlaces: Place[] = [
    {
      id: '1',
      name: 'Madison Square Garden',
      location: { latitude: 40.7505, longitude: -73.9934 },
      type: 'stadium',
    },
    {
      id: '2',
      name: 'Joe\'s Pizza',
      location: { latitude: 40.7282, longitude: -73.9942 },
      type: 'restaurant',
    },
    {
      id: '3',
      name: 'Barclays Center',
      location: { latitude: 40.6826, longitude: -73.9754 },
      type: 'stadium',
    },
    {
      id: '4',
      name: 'Shake Shack',
      location: { latitude: 40.7614, longitude: -73.9776 },
      type: 'restaurant',
    },
  ];

  // Request location permission and get user location using expo-location
  // expo-location provides GPS coordinates from the device
  // Google Maps API is used separately for rendering the map and markers
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission denied', 'Location permission is required to use the map');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const userLoc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        
        setUserLocation(userLoc);
        setPlaces(dummyPlaces);
        setLoading(false);
      } catch (error) {
        console.error('Error getting location:', error);
        // Fallback to NYC coordinates if location fails
        setUserLocation({ latitude: 40.7128, longitude: -74.0060 });
        setPlaces(dummyPlaces);
        setLoading(false);
      }
    };

    requestLocationPermission();
  }, []);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Search functionality
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // TODO: Replace with Google Places API search
    const filtered = places
      .map(place => ({
        ...place,
        distance: userLocation 
          ? calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              place.location.latitude, 
              place.location.longitude
            )
          : 0
      }))
      .filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    setSearchResults(filtered);
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    setShowSearchSheet(false);
    setQuery(result.name);
    // TODO: Recenter map to selected location
    if (webViewRef.current) {
      const script = `
        map.setCenter({ lat: ${result.location.latitude}, lng: ${result.location.longitude} });
        map.setZoom(15);
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  const handleMicrophonePress = () => {
    // TODO: Implement voice search
    console.log('Voice search pressed');
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'stadium':
        return '🏟️';
      case 'restaurant':
        return '🍕';
      default:
        return '📍';
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'stadium':
        return '#FF6B6B';
      case 'restaurant':
        return '#4ECDC4';
      default:
        return '#45B7D1';
    }
  };

  // Generate HTML for Google Maps WebView
  const generateMapHTML = () => {
    if (!userLocation) {
      console.log('📍 No user location available yet');
      return '';
    }

    const apiKey = getGoogleMapsApiKey();
    console.log('🗺️ Generating map HTML with API key:', apiKey ? 'Found' : 'Missing');
    
    if (!apiKey) {
      console.error('❌ Google Maps API key not found. Please check your environment variables.');
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                font-family: Arial, sans-serif;
                background-color: #f5f5f5;
              }
              .error-container {
                text-align: center; 
                padding: 20px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 300px;
              }
              .error-title {
                color: #d32f2f;
                margin-bottom: 10px;
              }
              .error-message {
                color: #666;
                line-height: 1.4;
              }
            </style>
          </head>
          <body>
            <div class="error-container">
              <h2 class="error-title">Google Maps API Key Missing</h2>
              <p class="error-message">Please configure your Google Maps API key in the environment variables.</p>
            </div>
          </body>
        </html>
      `;
    }

    const placesMarkers = places.map(place => `
      new google.maps.Marker({
        position: { lat: ${place.location.latitude}, lng: ${place.location.longitude} },
        map: map,
        title: '${place.name}',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="${getMarkerColor(place.type)}" stroke="white" stroke-width="2"/>
              <text x="20" y="26" text-anchor="middle" font-size="16">${getMarkerIcon(place.type)}</text>
            </svg>
          `)}',
          scaledSize: new google.maps.Size(40, 40),
          anchor: new google.maps.Point(20, 20)
        }
      });
    `).join('\n');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; }
            #map { width: 100%; height: 100vh; }
          </style>
        </head>
        <body>
          <div id="map"></div>
          <script>
            console.log('🗺️ Starting Google Maps initialization...');
            console.log('📍 User location:', { lat: ${userLocation.latitude}, lng: ${userLocation.longitude} });
            console.log('🏢 Places to show:', ${places.length});
            
            // Using your configured Google Maps API key
            const script = document.createElement('script');
            script.src = 'https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places';
            script.async = true;
            script.defer = true;
            
            // Add error handling for script loading
            script.onerror = function() {
              console.error('❌ Failed to load Google Maps API script');
              document.getElementById('map').innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; color: #d32f2f;"><div>Failed to load Google Maps. Please check your API key.</div></div>';
            };
            
            document.head.appendChild(script);

            let map;
            let userMarker;

            script.onload = function() {
              console.log('✅ Google Maps API script loaded successfully');
              
              try {
                // Initialize map centered on user location
                map = new google.maps.Map(document.getElementById('map'), {
                  center: { lat: ${userLocation.latitude}, lng: ${userLocation.longitude} },
                  zoom: 15,
                  mapTypeId: google.maps.MapTypeId.ROADMAP,
                  styles: [
                    {
                      featureType: 'poi',
                      elementType: 'labels',
                      stylers: [{ visibility: 'off' }]
                    }
                  ]
                });
                
                console.log('✅ Map initialized successfully');

                // Add user location marker
                userMarker = new google.maps.Marker({
                  position: { lat: ${userLocation.latitude}, lng: ${userLocation.longitude} },
                  map: map,
                  title: 'You are here',
                  icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#007AFF" stroke="white" stroke-width="3"/>
                        <path d="M20 8 L24 16 L20 20 L16 16 Z" fill="white"/>
                      </svg>
                    `)}',
                    scaledSize: new google.maps.Size(40, 40),
                    anchor: new google.maps.Point(20, 20)
                  }
                });
                
                console.log('✅ User location marker added');

                // Add place markers
                ${placesMarkers}
                
                console.log('✅ Place markers added');

                // Add click listener to map
                map.addListener('click', function(event) {
                  console.log('🗺️ Map clicked at:', event.latLng.lat(), event.latLng.lng());
                });
                
                console.log('✅ Map setup complete');
                
              } catch (error) {
                console.error('❌ Error initializing map:', error);
                document.getElementById('map').innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: Arial, sans-serif; color: #d32f2f;"><div>Error initializing map: ' + error.message + '</div></div>';
              }
            };

            // Function to recenter map (called from React Native)
            function recenterMap(lat, lng) {
              if (map) {
                map.setCenter({ lat: lat, lng: lng });
                map.setZoom(15);
                console.log('📍 Map recentered to:', lat, lng);
              }
            }
          </script>
        </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  // Show error state if WebView failed to load
  if (webViewError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
        <Text style={styles.errorTitle}>Map Loading Error</Text>
        <Text style={styles.errorMessage}>{webViewError}</Text>
        <Pressable 
          style={styles.retryButton}
          onPress={() => {
            setWebViewError(null);
            setLoading(true);
            // Retry location request
            setTimeout(() => setLoading(false), 1000);
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Google Maps WebView */}
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.webViewLoading}>
            <ActivityIndicator size="large" color="#111" />
            <Text style={styles.loadingText}>Loading Google Maps...</Text>
          </View>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ WebView error:', nativeEvent);
          setWebViewError('Failed to load Google Maps. Please check your internet connection and API key.');
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('❌ WebView HTTP error:', nativeEvent);
          setWebViewError('HTTP error loading Google Maps. Please check your API key configuration.');
        }}
        onMessage={(event) => {
          console.log('📨 Message from WebView:', event.nativeEvent.data);
        }}
        onLoadEnd={() => {
          console.log('✅ WebView loaded successfully');
        }}
        onLoadStart={() => {
          console.log('🔄 WebView started loading');
        }}
      />

      {/* Search Bar */}
      <View style={[styles.searchContainer, { bottom: insets.bottom + 20 }]}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Where to?"
            placeholderTextColor="#6B7280"
            value={query}
            onChangeText={handleSearch}
            onFocus={() => setShowSearchSheet(true)}
          />
          <Pressable onPress={handleMicrophonePress} style={styles.micButton}>
            <Ionicons name="mic-outline" size={20} color="#FF3B30" />
          </Pressable>
        </View>
      </View>

      {/* Search Results Bottom Sheet */}
      <Modal
        visible={showSearchSheet}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSearchSheet(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom }]}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>Search Results</Text>
              <Pressable onPress={() => setShowSearchSheet(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </Pressable>
            </View>

            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.searchResultItem}
                  onPress={() => handleSearchResultSelect(item)}
                >
                  <View style={styles.searchResultIcon}>
                    <Text style={styles.searchResultEmoji}>
                      {getMarkerIcon(item.type)}
                    </Text>
                  </View>
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultName}>{item.name}</Text>
                    <Text style={styles.searchResultDistance}>
                      {item.distance.toFixed(1)} km away
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.searchResultsList}
              ListEmptyComponent={() => (
                <View style={styles.emptySearchState}>
                  <Ionicons name="search-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptySearchTitle}>No results found</Text>
                  <Text style={styles.emptySearchSubtitle}>
                    Try searching for restaurants, stadiums, or events
                  </Text>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  map: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
  },
  searchContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#111',
  },
  micButton: {
    padding: 4,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '40%',
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
  },
  searchResultsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchResultEmoji: {
    fontSize: 20,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  searchResultDistance: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 52,
  },
  emptySearchState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptySearchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginTop: 16,
  },
  emptySearchSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BG,
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#111',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});