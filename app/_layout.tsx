import 'react-native-gesture-handler';
import 'react-native-reanimated'; // must be imported once before using reanimated stuff
import 'react-native-url-polyfill/auto';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { UserLocationProvider } from '../contexts/UserLocationContext';
import { UserRoleProvider } from '../contexts/UserRoleContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserRoleProvider>
        <UserLocationProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </UserLocationProvider>
      </UserRoleProvider>
    </GestureHandlerRootView>
  );
}
