import 'react-native-gesture-handler';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserLocationProvider } from '../contexts/UserLocationContext';
import { UserRoleProvider } from '../contexts/UserRoleContext';

// Read Expo env vars
const GOOGLE_MAPS_API_KEY_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID;
const GOOGLE_MAPS_API_KEY_IOS = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS;

console.log("Google Maps API Key Android:", GOOGLE_MAPS_API_KEY_ANDROID);
console.log("Google Maps API Key iOS:", GOOGLE_MAPS_API_KEY_IOS);

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserRoleProvider>
        <UserLocationProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ title: 'Welcome' }} />
            <Stack.Screen name="screen/login" options={{ title: 'Login' }} />
            <Stack.Screen name="screen/register" options={{ title: 'Register' }} />
            <Stack.Screen name="screen/password" options={{ title: 'Password' }} />
            <Stack.Screen name="screen/questions" options={{ title: 'Questions' }} />
            <Stack.Screen name="screen/locationsearch" options={{ title: 'Location Search' }} />
            <Stack.Screen name="screen/locationconfirm" options={{ title: 'Location Confirm' }} />
            <Stack.Screen name="screen/eventlist" options={{ title: 'Event List' }} />
            <Stack.Screen name="screen/eventdetail" options={{ title: 'Event Detail' }} />
            <Stack.Screen 
              name="screen/CreateEvent" 
              options={{ title: 'Create Event' }} 
            />
            <Stack.Screen name="screen/previewpost" options={{ title: 'Preview Post' }} />
            <Stack.Screen name="screen/eventdetailpreview" options={{ title: 'Event Detail Preview' }} />
            <Stack.Screen name="screen/groups" options={{ title: 'Groups' }} />
            <Stack.Screen name="screen/message" options={{ title: 'Message' }} />
            <Stack.Screen name="screen/privatemessages" options={{ title: 'Private Messages' }} />
            <Stack.Screen name="screen/chat" options={{ title: 'Chat' }} />
            <Stack.Screen name="screen/profile" options={{ title: 'Profile' }} />
            <Stack.Screen name="screen/gigagent/editprofile" options={{ title: 'Edit Profile' }} />
            <Stack.Screen name="screen/books" options={{ title: 'Books' }} />
            <Stack.Screen name="screen/map" options={{ title: 'Map' }} />
          </Stack>
        </UserLocationProvider>
      </UserRoleProvider>
    </GestureHandlerRootView>
  );
}
