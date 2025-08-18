import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
};

const MOCK: Thread[] = [
  { id: '1', name: 'Julian Smith', initials: 'JS', preview: 'Hi!', time: '4:05 PM', unread: true },
  { id: '2', name: 'Maya Johnson', initials: 'MJ', preview: 'Attachment: 1 Video', time: '4:00 PM' },
  { id: '3', name: 'King Slaine (Promoter)', initials: 'KS', preview: 'Invite: Friday showcase', time: '2:18 PM' },
];

export default function PrivateMessages() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const data = useMemo(() => MOCK, []);

  const onOpenThread = (t: { name: string; initials: string }) => {
    router.push(`/screen/message?fromScreen=privatemessages&name=${encodeURIComponent(t.name)}&initials=${t.initials}`);
  };

  const onCompose = () => {
    router.push('/screen/message?fromScreen=privatemessages');
  };

  const onBack = () => {
    // Always navigate back to gig.tsx inside the gigagent folder
    router.push('/screen/eventlist');
  };

  const renderItem = ({ item }: { item: Thread }) => (
    <Pressable
      onPress={() => onOpenThread?.(item)}
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
            onPress={Platform.OS === 'ios' ? undefined : onBack}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={Platform.OS === 'ios' ? 'Edit' : 'Back'}
            style={styles.actionBtn}
          >
            <Text style={styles.actionText}>{Platform.OS === 'ios' ? 'Edit' : 'Back'}</Text>
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
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        style={{ flex: 1, backgroundColor: CARD }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}
      />
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
});
