import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  time: string;
};

const DATA: NotificationItem[] = [
  {
    id: '1',
    title: 'Promoter King Slaine invited you to a gig',
    body: '"Looking for new wrestlers" • NYC • July 24',
    time: '6m',
  },
  {
    id: '2',
    title: 'Payment received',
    body: 'Wrestling Group • $200.00',
    time: '2h',
  },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      {/* Header row with avatar search + inbox icon could live here later if needed */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Notifications</Text>

        {DATA.map((n) => (
          <View key={n.id} style={styles.card}>
            <View style={styles.cardLeft}>
              <View style={styles.emojiBadge}>
                <Ionicons name="rocket-outline" size={20} color="#111" />
              </View>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.cardTitle} numberOfLines={2}>{n.title}</Text>
                <Text style={styles.time}>{n.time}</Text>
                <Pressable hitSlop={10} style={{ marginLeft: 8 }}>
                  <Ionicons name="ellipsis-horizontal" size={18} color="#6B7280" />
                </Pressable>
              </View>
              <Text style={styles.cardBody} numberOfLines={2}>{n.body}</Text>

              {n.id === '1' && (
                <Pressable
                  onPress={() => router.push('/screen/eventlist/eventdetail')}
                  style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
                >
                  <Text style={styles.ctaText}>View gig</Text>
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
    backgroundColor: '#EAF2FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
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
