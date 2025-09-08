import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';
import {
  createMessageNotification,
  getMessagesForConversation,
  MessageData,
  sendMessage,
  setupConversation
} from '../../utils/messageUtils';

const BG = '#F5F3F0';
const CARD = '#FFFFFF';
const TEXT = '#111';
const BORDER = '#E5E7EB';
const MUTED = '#6B7280';
const IOS_BLUE = '#0A84FF';


const TOPBAR_H = 56;
const AV = 48;

export default function Message() {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();
  
  // Get navigation parameters
  const { 
    fromScreen, 
    promoterId, 
    promoterName: paramPromoterName 
  } = useLocalSearchParams<{
    fromScreen?: string;
    promoterId?: string;
    promoterName?: string;
  }>();

  const [input, setInput] = useState('');
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoterProfile, setPromoterProfile] = useState<any>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardShown(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardShown(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Fetch promoter profile and set up conversation
  useEffect(() => {
    const setupChat = async () => {
      if (!promoterId || !auth.currentUser) {
        console.log('⚠️ Missing promoterId or user not authenticated');
        console.log('⚠️ promoterId:', promoterId);
        console.log('⚠️ auth.currentUser:', auth.currentUser?.uid);
        setLoading(false);
        return;
      }

      try {
        console.log('🔄 Setting up chat with promoter:', promoterId);
        console.log('🔄 Current user:', auth.currentUser.uid);
        
        // Setup conversation first (this is the critical part)
        const convId = await setupConversation(promoterId);
        setConversationId(convId);
        console.log('✅ Conversation setup complete:', convId);
        
        // Try to fetch promoter profile (optional, for display purposes)
        try {
          const promoterProfileRef = doc(db, 'profiles', promoterId);
          const promoterProfileSnap = await getDoc(promoterProfileRef);
          
          if (promoterProfileSnap.exists()) {
            const profileData = promoterProfileSnap.data();
            setPromoterProfile(profileData);
            console.log('✅ Promoter profile loaded:', profileData.name);
          } else {
            console.log('⚠️ Promoter profile not found, using fallback');
            setPromoterProfile({ name: paramPromoterName || 'Promoter' });
          }
        } catch (profileError) {
          console.log('⚠️ Could not fetch promoter profile, using fallback:', profileError);
          setPromoterProfile({ name: paramPromoterName || 'Promoter' });
        }
        
        // Set up real-time message listener
        const unsubscribe = getMessagesForConversation(convId, (msgs) => {
          console.log('📨 Received messages:', msgs.length);
          setMessages(msgs);
          setLoading(false);
        });
        
        return unsubscribe;
      } catch (error) {
        console.error('❌ Error setting up chat:', error);
        console.error('❌ Error details:', error);
        setLoading(false);
      }
    };

    setupChat();
  }, [promoterId, paramPromoterName]);

  /**
   * Handle back button navigation based on where the user came from
   * This ensures proper navigation flow and maintains context
   */
  const handleBack = () => {
    // Always navigate back to the fromScreen parameter if provided
    if (fromScreen) {
      switch (fromScreen) {
        case 'notifications':
          // Return to eventlist with notifications tab active to maintain bottom nav
          navigation.push('/screen/eventlist?activeTab=notifications');
          return;
        case 'privatemessages':
          navigation.push('/screen/Privatemessages');
          return;
        case 'gigs':
          // Return to eventlist with gigs tab active to maintain bottom nav
          navigation.push('/screen/eventlist?activeTab=gigs');
          return;
        case 'profile':
          // Return to eventlist with profile tab active to maintain bottom nav
          navigation.push('/screen/eventlist?activeTab=profile');
          return;
        case 'eventdetail':
          // Return to the previous screen (eventdetail) using back navigation
          navigation.back();
          return;
        case 'savedprofile':
          // Return to the previous screen (savedprofile) using back navigation
          navigation.back();
          return;
        default:
          // For any other fromScreen value, use back navigation
          navigation.back();
          return;
      }
    }
    
    // Fallback - use router's back navigation if no fromScreen provided
    navigation.back();
  };

  const send = async () => {
    if (!input.trim() || !conversationId || !auth.currentUser) {
      console.log('⚠️ Cannot send message: missing input, conversationId, or user');
      return;
    }
    
    const messageText = input.trim();
    setInput('');
    
    try {
      console.log('📤 Sending message:', messageText);
      
      // Send message to Firestore using the new simplified function
      await sendMessage(conversationId, messageText);
      
      // Create notification for the receiver
      const senderName = auth.currentUser.displayName || 'Unknown User';
      await createMessageNotification(
        promoterId || '',
        senderName,
        messageText,
        conversationId
      );
      
      console.log('✅ Message sent and notification created');
      
      // Scroll to bottom
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } catch (error) {
      console.error('❌ Error sending message:', error);
      // Restore input on error
      setInput(messageText);
    }
  };

  const renderItem = ({ item }: { item: MessageData }) => {
    const mine = item.senderId === auth.currentUser?.uid;
    const displayName = promoterProfile?.name || paramPromoterName || 'Promoter';
    
    return (
      <View 
        style={[styles.bubbleRow, mine ? { justifyContent: 'flex-end' } : null]}
        accessibilityRole="none"
        accessibilityLabel={`${mine ? 'You' : displayName}: ${item.text}`}
      >
        <View 
          style={[styles.bubble, mine ? styles.bubbleMe : styles.bubbleThem]}
          accessibilityRole="text"
        >
          <Text style={[styles.bubbleText, mine && { color: '#fff' }]}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* White control bar (under status bar) */}
      <View style={[styles.topBar, { paddingTop: insets.top, height: insets.top + TOPBAR_H }]}>
        <Pressable
          onPress={handleBack}
          hitSlop={16}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={24} color={TEXT} />
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable hitSlop={12} style={styles.iconBtn} accessibilityLabel="Camera">
          <Ionicons name="camera-outline" size={22} color={IOS_BLUE} />
        </Pressable>
      </View>

      {/* Recipient header (grey, centered) */}
      <View style={styles.recipientHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {promoterProfile?.name ? promoterProfile.name.charAt(0).toUpperCase() : 'P'}
          </Text>
        </View>
        <Text style={styles.recipientName} numberOfLines={1}>
          {promoterProfile?.name || paramPromoterName || 'Promoter'}
        </Text>
      </View>

      {/* Messages list */}
      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8 }}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        accessibilityRole="list"
        accessibilityLabel="Message conversation"
        ListEmptyComponent={
          loading ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: '#6B7280', fontSize: 16 }}>Loading messages...</Text>
            </View>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: '#6B7280', fontSize: 16 }}>No messages yet</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 14, marginTop: 4 }}>Start the conversation!</Text>
            </View>
          )
        }
      />

      {/* Input pinned above keyboard with no extra gap */}
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        // No nav header from a stack, so we don't need a vertical offset.
        keyboardVerticalOffset={0}
      >
        <View
          style={[
            styles.inputBar,
            {
              paddingBottom: keyboardShown ? 8 : Math.max(8, insets.bottom),
            },
          ]}
        >
          <Pressable style={styles.addBtn} hitSlop={10} accessibilityLabel="Add">
            <Ionicons name="add" size={20} color={TEXT} />
          </Pressable>

          <TextInput
            style={{
              flex: 1,
              backgroundColor: '#FFFFFF',
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 8,
              fontSize: 16,
              color: '#000000',
              borderWidth: 1,
              borderColor: '#D1D5DB',
            }}
            placeholder="Message"
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            returnKeyType="send"
          />

          <Pressable onPress={send} style={styles.sendBtn} hitSlop={10} accessibilityLabel="Send">
            <Ionicons name="send" size={20} color="#FFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    backgroundColor: CARD,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
    zIndex: 10,
    elevation: 2,
  },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  recipientHeader: {
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BORDER,
  },
  avatar: {
    width: AV,
    height: AV,
    borderRadius: AV / 2,
    backgroundColor: '#C7CBD3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  recipientName: { fontSize: 18, fontWeight: '800', color: TEXT },

  bubbleRow: { width: '100%', marginVertical: 6, flexDirection: 'row' },
  bubble: { maxWidth: '78%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 18 },
  bubbleMe: { backgroundColor: '#147AFF', borderTopRightRadius: 6 }, // iMessage blue
  bubbleThem: { backgroundColor: '#D9DDE3', borderTopLeftRadius: 6 },   // darker for AA contrast
  bubbleText: { fontSize: 16, lineHeight: 21, color: TEXT },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER,
  },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ECEFF3', alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: '#ECEFF3',
    color: TEXT,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
