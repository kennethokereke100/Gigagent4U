import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, onSnapshot, orderBy, query, where, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../../firebaseConfig';
import { Notification, NotificationType } from '../../../types/notifications';

const BG = '#F5F3F0';

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  icon: string;
  ctaText?: string;
  ctaAction?: () => void;
  read: boolean;
  createdAt: any; // Firestore Timestamp
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // Convert Firestore notification to UI notification
  const convertFirestoreToNotification = (doc: any): NotificationItem => {
    const data = doc.data() as Notification;
    const createdAt = data.createdAt?.toDate?.() || new Date();
    const now = new Date();
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let timeString = '';
    if (diffMins < 1) timeString = 'now';
    else if (diffMins < 60) timeString = `${diffMins}m`;
    else if (diffHours < 24) timeString = `${diffHours}h`;
    else timeString = `${diffDays}d`;

    // Use the type from the notification data, with fallback based on message content
    let type: NotificationType = data.type || 'message';
    let icon = 'chatbubble-outline';
    
    // Set icon based on notification type
    switch (type) {
      case 'first_post':
        icon = 'trophy-outline';
        break;
      case 'gig_invite':
        icon = 'calendar-outline';
        break;
      case 'message':
        icon = 'chatbubble-outline';
        break;
      case 'application_confirmation':
        icon = 'checkmark-circle-outline';
        break;
      case 'new_application':
        icon = 'person-add-outline';
        break;
    }

    return {
      id: doc.id,
      type,
      title: data.message,
      body: '', // We'll use the message as title for now
      time: timeString,
      icon,
      ctaText: data.cta,
      read: data.read,
      createdAt: data.createdAt,
    };
  };

  // Load notifications from Firestore
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    // Query requires composite index: userId (ASC) + createdAt (DESC)
    // Index defined in firestore.indexes.json
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      try {
        const notificationItems = snapshot.docs.map(convertFirestoreToNotification);
        setNotifications(notificationItems);
        setLoading(false);
        console.log('✅ Loaded', notificationItems.length, 'notifications');
      } catch (error) {
        console.error('❌ Error loading notifications:', error);
        setLoading(false);
      }
    }, (error) => {
      console.error('❌ Error listening to notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Mark all notifications as read when screen is visited and trigger confetti for first post
  useEffect(() => {
    if (notifications.length > 0 && auth.currentUser) {
      const unreadNotifications = notifications.filter(n => !n.read);
      if (unreadNotifications.length > 0) {
        // Check if there's an unread first_post notification with congratulations message
        const hasFirstPostNotification = unreadNotifications.some(n => 
          n.type === 'first_post' && n.title.includes('Congratulations on your first event')
        );
        
        if (hasFirstPostNotification) {
          // Trigger confetti animation for first post notification
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        
        markAllAsRead();
      }
    }
  }, [notifications]);

  const markAllAsRead = async () => {
    if (!auth.currentUser) return;

    try {
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.read);
      
      unreadNotifications.forEach(notification => {
        const notificationRef = doc(db, 'notifications', notification.id);
        batch.update(notificationRef, { read: true });
      });

      await batch.commit();
      console.log('✅ Marked', unreadNotifications.length, 'notifications as read');
    } catch (error) {
      console.error('❌ Error marking notifications as read:', error);
    }
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    switch (notification.type) {
      case 'gig_invite':
        // Navigate to eventlist screen with gigs tab active
        router.push('/screen/eventlist?activeTab=gigs');
        break;
      case 'message':
        // Navigate to message with conversation ID
        const conversationId = (notification as any).conversationId;
        if (conversationId) {
          router.push(`/screen/Message?fromScreen=notifications&conversationId=${conversationId}`);
        } else {
          router.push('/screen/Message?fromScreen=notifications');
        }
        break;
      case 'first_post':
        // For first post notification, no special action needed
        break;
    }
  };

  const handleCTAPress = (notification: NotificationItem) => {
    // Handle CTA button press separately from notification press
    switch (notification.type) {
      case 'gig_invite':
        // Navigate to eventlist screen with gigs tab active
        router.push('/screen/eventlist?activeTab=gigs');
        break;
      case 'message':
        // Navigate to message with conversation ID
        const ctaConversationId = (notification as any).conversationId;
        if (ctaConversationId) {
          router.push(`/screen/Message?fromScreen=notifications&conversationId=${ctaConversationId}`);
        } else {
          router.push('/screen/Message?fromScreen=notifications');
        }
        break;
      case 'first_post':
        // For first post notification, navigate to gigs tab
        router.push('/screen/eventlist?activeTab=gigs');
        break;
      case 'application_confirmation':
        // Navigate to message screen
        router.push('/screen/Message');
        break;
      case 'new_application':
        // Navigate to gig screen with candidates tab active
        router.push('/screen/eventlist?activeTab=gigs');
        break;
      default:
        console.log('CTA clicked for notification:', notification.id);
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
      {/* Confetti Animation for First Post Notification */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
          autoStart={true}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
        />
      )}
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

        {loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="hourglass-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateEmoji}>🎉</Text>
            <Text style={styles.emptyStateTitle}>No notifications yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              You'll see updates about your events and messages here
            </Text>
          </View>
        ) : (
          notifications.map((notification) => (
          <Pressable 
            key={notification.id} 
            style={styles.card}
            onPress={() => handleNotificationPress(notification)}
          >
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
          </Pressable>
          ))
        )}
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
