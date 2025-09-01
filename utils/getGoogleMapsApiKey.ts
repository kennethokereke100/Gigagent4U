import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getGoogleMapsApiKey(): string {
  // First try platform-specific keys
  const iosKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS;
  const androidKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;
  
  if (Platform.OS === 'ios' && iosKey) {
    return iosKey;
  }
  
  if (Platform.OS === 'android' && androidKey) {
    return androidKey;
  }
  
  // Fallback to DEV key
  if (__DEV__) {
    return Constants.expoConfig?.extra?.googleMapsApiKeyDev || '';
  }
  
  // Fallback to PROD key
  return Constants.expoConfig?.extra?.googleMapsApiKeyProd || '';
}
