import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserRole } from '../../contexts/UserRoleContext';
import { auth, db } from '../../firebaseConfig';
import GigScreen from './gigagent/gig';
// import Groups from './gigagent/groups';
import NotificationsScreen from './gigagent/notifications';
import ProfileScreen from './gigagent/profile';
import LogoutScreen from './logout';

const BG = '#F5F3F0';
type TabKey = 'gigs' | 'notifications' | 'profile' | 'settings';

export default function EventList() {
  const insets = useSafeAreaInsets();
  const { role } = useUserRole();
  const [tab, setTab] = useState<TabKey>('gigs');
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Get URL parameters to set initial tab
  const { activeTab } = useLocalSearchParams<{ activeTab?: TabKey }>();
  
  // Set the active tab based on URL parameter
  useEffect(() => {
    if (activeTab && ['gigs', 'notifications', 'profile', 'settings'].includes(activeTab)) {
      setTab(activeTab as TabKey);
    }
  }, [activeTab]);

  // Listen for unread notifications
  useEffect(() => {
    if (!auth.currentUser) {
      setUnreadCount(0);
      return;
    }

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
      console.log('📱 Unread notifications count:', snapshot.docs.length);
    }, (error) => {
      console.error('❌ Error listening to unread notifications:', error);
      setUnreadCount(0);
    });

    return () => unsubscribe();
  }, []);

  // Compute a single nav height we can reuse everywhere
  const NAV_BASE = 60; // room for icon + label
  const navHeight = useMemo(() => NAV_BASE + insets.bottom, [insets.bottom]);

  const renderScreen = () => {
    switch (tab) {
      case 'gigs': 
        return <GigScreen />;
      // case 'groups': return <Groups />;
      case 'notifications': return <NotificationsScreen />;
      case 'profile': return <ProfileScreen />;
      case 'settings': return <LogoutScreen />;
      default: return null;
    }
  };

  // Determine which tabs should be visible based on role
  const getVisibleTabs = (): TabKey[] => {
    return ['gigs', 'notifications', 'profile', 'settings']; 
  };

  const NavItem = ({
    k,
    icon,
    label,
    showBadge = false,
  }: { 
    k: TabKey; 
    icon: [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]; 
    label: string;
    showBadge?: boolean;
  }) => {
    const active = tab === k;
    return (
      <Pressable onPress={() => setTab(k)} style={styles.navItem} hitSlop={10}>
        <View style={styles.iconWrapper}>
          <Ionicons name={active ? icon[0] : icon[1]} size={24} color={active ? '#111' : '#9CA3AF'} />
          {showBadge && unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
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
        <NavItem k="gigs" icon={['home', 'home-outline']} label="Gigs" />
        {/* <NavItem k="groups" icon={['people', 'people-outline']} label="Groups" /> */}
        <NavItem k="notifications" icon={['notifications', 'notifications-outline']} label="Notifications" showBadge={true} />
        <NavItem k="profile" icon={['person', 'person-outline']} label="Profile" />
        <NavItem k="settings" icon={['settings', 'settings-outline']} label="Settings" />
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
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});