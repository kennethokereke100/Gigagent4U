import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

type NotificationType = 'gig_invite' | 'message';

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  icon: string;
  ctaText?: string;
  ctaAction?: () => void;
};

const DATA: NotificationItem[] = [
  {
    id: '1',
    type: 'gig_invite',
    title: 'Promoter King Slaine invited you to a gig',
    body: '"Looking for new wrestlers" • NYC • July 24',
    time: '6m',
    icon: 'calendar-outline',
    ctaText: 'View gig',
    ctaAction: () => {
      // Navigation logic will be handled by the component
    },
  },
  {
    id: '2',
    type: 'message',
    title: 'New message from King Slaine',
    body: 'Hey Julian! Long time no see...',
    time: '1h',
    icon: 'chatbubble-outline',
    ctaText: 'Reply',
    ctaAction: () => {
      // Navigation logic will be handled by the component
    },
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleNotificationPress = (notification: NotificationItem) => {
    switch (notification.type) {
      case 'gig_invite':
        // Navigate to eventlist screen with gigs tab active
        router.push('/screen/Eventlist?activeTab=gigs');
        break;
      case 'message':
        // Navigate to message with fromScreen parameter
        router.push(`/screen/Message?fromScreen=notifications&name=${encodeURIComponent('King Slaine (Promoter)')}&initials=KS`);
        break;
    }
  };

  const handleCTAPress = (notification: NotificationItem) => {
    // Handle CTA button press separately from notification press
    switch (notification.type) {
      case 'gig_invite':
        // Navigate to eventlist screen with gigs tab active
        router.push('/screen/Eventlist?activeTab=gigs');
        break;
      case 'message':
        // Navigate to message with fromScreen parameter
        router.push(`/screen/Message?fromScreen=notifications&name=${encodeURIComponent('King Slaine (Promoter)')}&initials=KS`);
        break;
    }
  };

  const getAccessibilityLabel = (notification: NotificationItem) => {
    const timeLabel = `${notification.time} ago`;
    switch (notification.type) {
      case 'gig_invite':
        return `Gig invitation: ${notification.title}. ${notification.body}. ${timeLabel}`;
      case 'message':
        return `New message: ${notification.title}. ${notification.body}. ${timeLabel}`;
      default:
        return `${notification.title}. ${notification.body}. ${timeLabel}`;
    }
  };

  const getAccessibilityHint = (notification: NotificationItem) => {
    switch (notification.type) {
      case 'gig_invite':
        return 'Double tap to view gig details';
      case 'message':
        return 'Double tap to reply to message';
      default:
        return 'Double tap to view details';
    }
  };

  return (
    <View 
      style={[styles.container, { paddingTop: insets.top + 8 }]}
      accessibilityRole="none"
      accessibilityLabel="Notifications screen"
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        accessibilityRole="list"
        accessibilityLabel="List of notifications"
      >
        <Text 
          style={styles.title}
          accessibilityRole="header"
          accessibilityLabel="Notifications"
        >
          Notifications
        </Text>

        {DATA.map((notification) => (
          <View key={notification.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View 
                style={styles.emojiBadge}
                accessibilityRole="image"
                accessibilityLabel={`${notification.type} notification icon`}
              >
                <Ionicons name={notification.icon as any} size={20} color="#111" />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text 
                  style={styles.cardTitle} 
                  numberOfLines={2}
                  accessibilityRole="text"
                >
                  {notification.title}
                </Text>
                <Text 
                  style={styles.time}
                  accessibilityRole="text"
                  accessibilityLabel={`${notification.time} ago`}
                >
                  {notification.time}
                </Text>
                <Pressable 
                  hitSlop={10} 
                  style={{ marginLeft: 8 }}
                  accessibilityRole="button"
                  accessibilityLabel="More options"
                  accessibilityHint="Double tap to see more options for this notification"
                >
                  <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
                </Pressable>
              </View>
              <Text 
                style={styles.cardBody} 
                numberOfLines={2}
                accessibilityRole="text"
              >
                {notification.body}
              </Text>

              {notification.ctaText && (
                <Pressable
                  onPress={() => handleCTAPress(notification)}
                  style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
                  accessibilityRole="button"
                  accessibilityLabel={notification.ctaText}
                  accessibilityHint={`Double tap to ${notification.ctaText.toLowerCase()}`}
                  accessibilityState={{ disabled: false }}
                >
                  <Text style={styles.ctaText}>{notification.ctaText}</Text>
                </Pressable>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 12 },
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardLeft: { paddingTop: 2 },
  emojiBadge: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB'
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111' },
  time: { fontSize: 12, color: '#6B7280' },
  cardBody: { fontSize: 14, color: '#111', marginBottom: 10 },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#111',
    backgroundColor: '#111',
  },
  ctaText: { color: '#fff', fontWeight: '700' },
});
