import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDoc, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';

const GROUPED = '#F2F2F7';
const CARD = '#FFFFFF';
const TEXT = '#111111';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';
const IOS_BLUE = '#0A84FF';

type Thread = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread?: boolean;
  otherUserId: string; // The other participant's user ID
  conversationId: string;
};

interface Conversation {
  id: string;
  members: string[];
  lastMessage: string;
  lastMessageAt: any;
  createdAt: any;
}

export default function PrivateMessages() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [conversations, setConversations] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch conversations for the current user
  useEffect(() => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }

    console.log('🔄 Fetching conversations for user:', auth.currentUser.uid);

    const conversationsQuery = query(
      collection(db, 'conversations'),
      where('members', 'array-contains', auth.currentUser.uid),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(conversationsQuery, async (snapshot) => {
      console.log('📨 Received conversations snapshot:', snapshot.docs.length);
      
      const conversationThreads: Thread[] = [];
      
      for (const doc of snapshot.docs) {
        const conversationData = doc.data() as Conversation;
        
        // Find the other user ID (not the current user)
        const otherUserId = conversationData.members.find(uid => uid !== auth.currentUser?.uid);
        
        if (otherUserId) {
          try {
            // Fetch the other user's profile to get their name
            const profileRef = doc(db, 'profiles', otherUserId);
            const profileSnap = await getDoc(profileRef);
            
            let name = 'Unknown User';
            if (profileSnap.exists()) {
              const profileData = profileSnap.data() as any;
              name = profileData?.name || profileData?.nickname || 'Unknown User';
            }
            
            // Format the time
            const time = formatMessageTime(conversationData.lastMessageAt);
            
            conversationThreads.push({
              id: doc.id,
              name: name,
              initials: getInitials(name),
              preview: conversationData.lastMessage || 'No messages yet',
              time: time,
              unread: false, // TODO: Implement unread logic
              otherUserId: otherUserId,
              conversationId: doc.id
            });
          } catch (error) {
            console.error('❌ Error fetching profile for user:', otherUserId, error);
          }
        }
      }
      
      setConversations(conversationThreads);
      setLoading(false);
      console.log('✅ Conversations loaded:', conversationThreads.length);
    }, (error) => {
      console.error('❌ Error listening to conversations:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const onOpenThread = (thread: Thread) => {
    console.log('💬 Opening conversation with:', thread.name);
    router.push({
      pathname: '/screen/Message',
      params: {
        fromScreen: 'privatemessages',
        promoterId: thread.otherUserId,
        promoterName: thread.name
      }
    });
  };

  const onCompose = () => {
    router.push('/screen/Message?fromScreen=privatemessages');
  };

  const onBack = () => {
    // Always navigate back to gig.tsx inside the gigagent folder
    router.push('/screen/eventlist');
  };

  const renderItem = ({ item }: { item: Thread }) => (
    <Pressable
      onPress={() => onOpenThread(item)}
      style={styles.row}
      android_ripple={{ color: '#00000010' }}
    >
      <View style={styles.leftWrap}>
        {item.unread ? <View style={styles.unreadDot} /> : <View style={{ width: 8 }} />}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.initials}</Text>
        </View>
      </View>

      <View style={styles.mid}>
        <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
        <Text numberOfLines={1} style={styles.preview}>{item.preview}</Text>
      </View>

      <View style={styles.right}>
        <Text style={styles.time}>{item.time}</Text>
        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: GROUPED }}>
      {/* ===== iOS-style two-row header, always below the status bar ===== */}
      <View style={[styles.headerWrap, { paddingTop: insets.top }]}>
        {/* Row 1: left/right actions (kept away from the bottom edge) */}
        <View style={styles.controlsRow}>
          <Pressable
            onPress={onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={styles.actionBtn}
          >
            <Text style={styles.actionText}>Back</Text>
          </Pressable>

          <Pressable
            onPress={onCompose}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="New message"
            style={styles.actionBtn}
          >
            <Ionicons name="create-outline" size={22} color={IOS_BLUE} />
          </Pressable>
        </View>

        {/* Row 2: large centered title with even top/bottom padding */}
        <View style={styles.titleRow}>
          <Text style={styles.largeTitle}>Messages</Text>
        </View>

        <View style={styles.headerDivider} />
      </View>

      {/* ===== List ===== */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={IOS_BLUE} />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          style={{ flex: 1, backgroundColor: CARD }}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No conversations yet</Text>
              <Text style={styles.emptySubtext}>Start a conversation by messaging someone</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const AV = 40;

const styles = StyleSheet.create({
  /* Header container */
  headerWrap: {
    backgroundColor: GROUPED,
  },

  /* Row 1: actions */
  controlsRow: {
    height: 44,                       // native control bar height
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',             // centers vertically
    justifyContent: 'space-between',
  },
  actionBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  actionText: { fontSize: 17, color: IOS_BLUE, fontWeight: '600' },

  /* Row 2: large title */
  titleRow: {
    height: 44,                       // gives the title breathing room
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeTitle: {
    fontSize: 32,                     // iOS large title size
    lineHeight: 36,
    fontWeight: '800',
    color: TEXT,
    textAlign: 'center',
  },

  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },

  /* Rows */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  leftWrap: { width: 60, flexDirection: 'row', alignItems: 'center', gap: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: IOS_BLUE },
  avatar: {
    width: AV, height: AV, borderRadius: AV / 2,
    backgroundColor: '#E5E5EA', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#666', fontWeight: '700' },
  mid: { flex: 1 },
  name: { fontSize: 17, color: TEXT, fontWeight: '700' },
  preview: { fontSize: 14, color: MUTED, marginTop: 2 },
  right: { alignItems: 'flex-end', justifyContent: 'center', width: 70, gap: 6 },
  time: { fontSize: 13, color: MUTED },
  sep: { height: StyleSheet.hairlineWidth, backgroundColor: '#E9E9EB', marginLeft: 76 },
  
  // Loading and empty states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: MUTED,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    color: TEXT,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: MUTED,
    textAlign: 'center',
  },
});

// Utility functions
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatMessageTime(timestamp: any): string {
  if (!timestamp) return '';
  
  try {
    let date: Date;
    
    // Handle Firestore Timestamp
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      date = new Date(timestamp);
    }
    
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      // Show time for today
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      // Show day of week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  } catch (error) {
    console.error('❌ Error formatting time:', error);
    return '';
  }
}
