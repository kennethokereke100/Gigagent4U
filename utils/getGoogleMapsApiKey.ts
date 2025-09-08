import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getGoogleMapsApiKey(): string {
  console.log('🔑 Getting Google Maps API key...');
  
  // First try platform-specific keys from environment variables
  const iosKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS;
  const androidKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;
  const devKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_DEV;
  
  console.log('📱 Platform:', Platform.OS);
  console.log('🔑 iOS Key available:', !!iosKey);
  console.log('🔑 Android Key available:', !!androidKey);
  console.log('🔑 Dev Key available:', !!devKey);
  
  // Try platform-specific keys first
  if (Platform.OS === 'ios' && iosKey) {
    console.log('✅ Using iOS-specific API key');
    return iosKey;
  }
  
  if (Platform.OS === 'android' && androidKey) {
    console.log('✅ Using Android-specific API key');
    return androidKey;
  }
  
  // Fallback to DEV key (works in Expo Go)
  if (devKey) {
    console.log('✅ Using DEV API key (Expo Go compatible)');
    return devKey;
  }
  
  // Try Constants.expoConfig as fallback
  const constantsDevKey = Constants.expoConfig?.extra?.googleMapsApiKeyDev;
  const constantsProdKey = Constants.expoConfig?.extra?.googleMapsApiKeyProd;
  
  if (__DEV__ && constantsDevKey) {
    console.log('✅ Using Constants DEV key');
    return constantsDevKey;
  }
  
  if (constantsProdKey) {
    console.log('✅ Using Constants PROD key');
    return constantsProdKey;
  }
  
  console.error('❌ No Google Maps API key found!');
  console.log('Available env vars:', Object.keys(process.env).filter(key => key.includes('GOOGLE_MAPS')));
  console.log('Constants extra:', Constants.expoConfig?.extra);
  
  return '';
}
