import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

const BG = '#F5F3F0';
const CARD = '#FFFFFF';
const TEXT = '#111';
const BORDER = '#E5E7EB';
const MUTED = '#6B7280';
const IOS_BLUE = '#0A84FF';

type Msg = { id: string; from: 'me' | 'them'; text: string };

const TOPBAR_H = 56;
const AV = 48;

export default function Message({
  name = 'King Slaine (Promoter)',
  initials = 'KS',
}: {
  name?: string;
  initials?: string;
}) {
  const insets = useSafeAreaInsets();
  const navigation = useRouter();
  
  // Get navigation parameters to determine where user came from
  const { fromScreen, name: paramName, initials: paramInitials } = useLocalSearchParams<{
    fromScreen?: string;
    name?: string;
    initials?: string;
  }>();

  // Use parameters if provided, otherwise use props
  const displayName = paramName ? decodeURIComponent(paramName) : name;
  const displayInitials = paramInitials || initials;

  const [input, setInput] = useState('');
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '1', from: 'them', text: 'Hey Julian!' },
    { id: '2', from: 'them', text: 'Long time no see' },
    { id: '3', from: 'me', text: 'This is a test message' },
  ]);

  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardShown(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardShown(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

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
          navigation.push('/screen/privatemessages');
          return;
        case 'gigs':
          navigation.push('/screen/eventlist');
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

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { id: String(Date.now()), from: 'me', text: input.trim() }]);
    setInput('');
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const renderItem = ({ item }: { item: Msg }) => {
    const mine = item.from === 'me';
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
          <Text style={styles.avatarText}>{displayInitials}</Text>
        </View>
        <Text style={styles.recipientName} numberOfLines={1}>
          {displayName}
        </Text>
      </View>

      {/* Messages list */}
      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, paddingTop: 8 }}
        data={msgs}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        accessibilityRole="list"
        accessibilityLabel="Message conversation"
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
