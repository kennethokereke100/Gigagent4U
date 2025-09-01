import 'dotenv/config';

export default {
  expo: {
    name: "Gigagent4U",
    slug: "Gigagent4U",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "gigagent4u",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.gigagent4u.mobile",
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS
      }
    },
    android: {
      package: "com.gigagent4u.mobile",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {},
      eas: {
        projectId: "94478a8e-6845-49e4-8940-0ca044fd56f7"
      },
      googleMapsApiKeyDev: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_DEV,
      googleMapsApiKeyProd: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_PROD,
      googleMapsApiKeyIOS: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS,
      googleMapsApiKeyAndroid: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID,
    },
    owner: "kennethokereke00",
    runtimeVersion: "1.0.0",
    updates: {
      url: "https://u.expo.dev/94478a8e-6845-49e4-8940-0ca044fd56f7"
    }
  }
};
