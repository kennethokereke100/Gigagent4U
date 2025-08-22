import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserRole } from '../../contexts/UserRoleContext';
import GigScreen from './gigagent/gig';
import Groups from './gigagent/groups';
import NotificationsScreen from './gigagent/notifications';
import ProfileScreen from './gigagent/profile';

const BG = '#F5F3F0';
type TabKey = 'gigs' | 'groups' | 'notifications' | 'profile';

export default function EventList() {
  const insets = useSafeAreaInsets();
  const { role } = useUserRole();
  const [tab, setTab] = useState<TabKey>('gigs');
  
  // Get URL parameters to set initial tab
  const { activeTab } = useLocalSearchParams<{ activeTab?: TabKey }>();
  
  // Set the active tab based on URL parameter
  useEffect(() => {
    if (activeTab && ['gigs', 'groups', 'notifications', 'profile'].includes(activeTab)) {
      setTab(activeTab as TabKey);
    }
  }, [activeTab]);

  // Compute a single nav height we can reuse everywhere
  const NAV_BASE = 60; // room for icon + label
  const navHeight = useMemo(() => NAV_BASE + insets.bottom, [insets.bottom]);

  const renderScreen = () => {
    switch (tab) {
      case 'gigs': 
        return <GigScreen />;
      case 'groups': return <Groups />;
      case 'notifications': return <NotificationsScreen />;
      case 'profile': return <ProfileScreen />;
      default: return null;
    }
  };

  // Determine which tabs should be visible based on role
  const getVisibleTabs = (): TabKey[] => {
    if (role === 'promoter') {
      return ['gigs', 'groups', 'notifications', 'profile'];
    }
    return ['gigs', 'groups', 'notifications', 'profile']; // for talents and others
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
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      {/* Content container with no top padding to ensure status bar overlap */}
      <View style={styles.contentContainer}>{renderScreen()}</View>

      <View
        style={[
          styles.navBar,
          {
            height: navHeight,
            paddingBottom: insets.bottom, // sits above the home indicator
          },
        ]}
      >
        {getVisibleTabs().includes('gigs') && (
          <NavItem k="gigs" icon={['home', 'home-outline']} label="Gigs" />
        )}
        {getVisibleTabs().includes('groups') && (
          <NavItem k="groups" icon={['people', 'people-outline']} label="Groups" />
        )}
        {getVisibleTabs().includes('notifications') && (
          <NavItem k="notifications" icon={['notifications', 'notifications-outline']} label="Notifications" />
        )}
        {getVisibleTabs().includes('profile') && (
          <NavItem k="profile" icon={['person', 'person-outline']} label="Profile" />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BG 
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 76, // Fixed height for nav bar to avoid layout shifts
  },
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
