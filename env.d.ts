declare module '@env' {
  export const GOOGLE_MAPS_API_KEY_ANDROID: string;
  export const GOOGLE_MAPS_API_KEY_IOS: string;
}

declare module 'expo-env' {
  export const env: {
    GOOGLE_MAPS_API_KEY_ANDROID: string;
    GOOGLE_MAPS_API_KEY_IOS: string;
  };
}
