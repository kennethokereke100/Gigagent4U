import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

type Activity = {
  id: string;
  title: string;        // e.g., "Wrestling Group"
  subtitle: string;     // e.g., "You got paid $200.00"
  amount: number;       // positive for received, negative for paid out
  date: string;         // e.g., "Jul 17, 2024"
  avatar: string;       // any image url
};

const AVATARS = [
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=200',
  'https://images.unsplash.com/photo-1548890763-8c6d8e1e7f2a?q=80&w=200',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=200',
];

const mockActivities: Activity[] = [
  {
    id: '1',
    title: 'Wrestling Group',
    subtitle: 'You received payment',
    amount: 200,
    date: 'Jul 17',
    avatar: AVATARS[0],
  },
  {
    id: '2',
    title: 'Comedy Collective',
    subtitle: 'You received payment',
    amount: 150,
    date: 'Jul 16',
    avatar: AVATARS[1],
  },
  {
    id: '3',
    title: 'UFC Talent Pool',
    subtitle: 'Payout to vendor',
    amount: -75,
    date: 'Jul 15',
    avatar: AVATARS[2],
  },
  {
    id: '4',
    title: 'Boxing Association',
    subtitle: 'You received payment',
    amount: 325,
    date: 'Jul 14',
    avatar: AVATARS[3],
  },
];

function currency(n: number) {
  return `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BooksScreen() {
  const insets = useSafeAreaInsets();

  const totals = useMemo(() => {
    const received = mockActivities.filter(a => a.amount > 0).reduce((s, a) => s + a.amount, 0);
    const paidOut = mockActivities.filter(a => a.amount < 0).reduce((s, a) => s + Math.abs(a.amount), 0);
    const net = received - paidOut;
    return { received, paidOut, net };
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          // add safe-area top so content starts below the status bar
          paddingTop: insets.top + 12,
          // keep extra space at the bottom for the fixed tab bar
          paddingBottom: insets.bottom + 64,
        },
      ]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        // remove any paddingTop here (let the container handle it)
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header / Summary — mirrors Screenshot #2 layout; content from Screenshot #1 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>MY cash flow</Text>

          <View style={styles.netRow}>
            <Text style={styles.netAmount}>{currency(totals.net)}</Text>
            <Text style={styles.netCaption}>Net</Text>
          </View>

          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <Ionicons name="arrow-down-circle" size={18} color="#111" />
              <Text style={styles.metricLabel}>Gigs</Text>
              <Text style={styles.metricValue}>{currency(totals.received)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Ionicons name="arrow-up-circle" size={18} color="#111" />
              <Text style={styles.metricLabel}>Paid Out</Text>
              <Text style={styles.metricValue}>{currency(totals.paidOut)}</Text>
            </View>
          </View>
        </View>

        {/* Activities list header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activities</Text>
          <Text style={styles.sectionAction}>All activities</Text>
        </View>

        {/* Activities list — layout like Screenshot #2 but with our copy */}
        <FlatList
          data={mockActivities}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const isCredit = item.amount > 0;
            return (
              <View style={styles.activityRow}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.activityText}>
                  <Text style={styles.activityTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.activitySubtitle} numberOfLines={1}>
                    {item.subtitle} · {item.date}
                  </Text>
                </View>
                <Text style={[styles.amount, { color: isCredit ? '#0F766E' : '#B91C1C' }]}>
                  {isCredit ? '+' : '-'}{currency(item.amount)}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </View>
            );
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 16,
    // 🔴 remove paddingTop: 16 (safe-area now handles it)
  },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  summaryTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  netRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  netAmount: { fontSize: 32, fontWeight: '800', color: '#111' },
  netCaption: { fontSize: 12, color: '#6B7280' },

  metrics: { flexDirection: 'row', gap: 16, marginTop: 4 },
  metricItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  metricLabel: { fontSize: 12, color: '#6B7280' },
  metricValue: { fontSize: 16, fontWeight: '700', color: '#111' },

  sectionHeader: {
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  sectionAction: { fontSize: 14, color: '#6B7280' },

  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEE' },
  activityText: { flex: 1 },
  activityTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  activitySubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  amount: { fontSize: 15, fontWeight: '700' },

  separator: { height: 1, backgroundColor: '#E5E7EB' },
});
