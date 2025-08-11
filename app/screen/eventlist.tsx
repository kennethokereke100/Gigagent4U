import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BooksScreen from './gigagent/books';
import GigScreen from './gigagent/gig';
import NotificationsScreen from './gigagent/notifications';
import ProfileScreen from './gigagent/profile';
import Groups from './groups';

const BG = '#F5F3F0';
type TabKey = 'gigs' | 'groups' | 'books' | 'notifications' | 'profile';

export default function EventList() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<TabKey>('gigs');

  // Compute a single nav height we can reuse everywhere
  const NAV_BASE = 60; // room for icon + label
  const navHeight = useMemo(() => NAV_BASE + insets.bottom, [insets.bottom]);

  const renderScreen = () => {
    switch (tab) {
      case 'gigs': return <GigScreen />;
      case 'groups': return <Groups />;
      case 'books': return <BooksScreen />;
      case 'notifications': return <NotificationsScreen />;
      case 'profile': return <ProfileScreen />;
      default: return null;
    }
  };

  const NavItem = ({
    k,
    icon,
    label,
  }: { k: TabKey; icon: [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]; label: string }) => {
    const active = tab === k;
    return (
      <Pressable onPress={() => setTab(k)} style={styles.navItem} hitSlop={10}>
        <Ionicons name={active ? icon[0] : icon[1]} size={24} color={active ? '#111' : '#9CA3AF'} />
        <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Give the content room so it won't be covered by the absolute nav */}
      <View style={{ flex: 1, paddingBottom: navHeight }}>{renderScreen()}</View>

      <View
        style={[
          styles.navBar,
          {
            height: navHeight,
            paddingBottom: insets.bottom, // sits above the home indicator
          },
        ]}
      >
        <NavItem k="gigs" icon={['home', 'home-outline']} label="Gigs" />
        <NavItem k="groups" icon={['people', 'people-outline']} label="Groups" />
        <NavItem k="books" icon={['cash', 'cash-outline']} label="Books" />
        <NavItem k="notifications" icon={['notifications', 'notifications-outline']} label="Notifications" />
        <NavItem k="profile" icon={['person', 'person-outline']} label="Profile" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  navBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#fff',
    // keep it above all content
    zIndex: 1000,
    elevation: 12,
  },
  navItem: { alignItems: 'center', justifyContent: 'center', gap: 2, flex: 1 },
  navLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginTop: 2 },
  navLabelActive: { color: '#111' },
});
