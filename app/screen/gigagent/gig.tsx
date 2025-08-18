import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterBottomSheet from '../../../components/FilterBottomSheet';
import PickLocationSheet from '../../../components/PickLocationSheet';
import PillarChip from '../../../components/PillarChip';
import { useUserRole } from '../../../contexts/UserRoleContext';
import GigPrepPanel from '../../components/GigPrepPanel';

const Tab = createMaterialTopTabNavigator();

const BG = '#F5F3F0';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111';
const MUTED = '#6B7280';

// Segmented control styling (match screenshot)
const SEG_ACTIVE_BG = '#5B2331';     // maroon
const SEG_ACTIVE_TX = '#FFFFFF';
const SEG_INACTIVE_TX = '#6B7280';

type TimeBucket = 'now' | '24h' | '1d' | '1w' | '1m' | '1m_plus';

type Filters = {
  categories: string[];
  time?: TimeBucket;
  maxMiles?: number;
};

type GigTab = 'upcoming' | 'past' | 'invites';
type PromoterTab = 'myEvents' | 'candidates';

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  priceFrom: string;
  miles?: number;
  pillar: string;
  postedAt: string;
  distanceMi: number;
  startsAt: string;
  endsAt: string;
  applied?: boolean;
  invited?: boolean;
};

type City = { id: string; name: string; region?: string };

const MOCK_EVENTS: EventItem[] = [
  { id: '1', title: 'Looking for new wrestlers', date: 'July 24th', time: '6:00 – 8:00 PM EDT', venue: 'El Rio', priceFrom: '$17.85', miles: 4.5, pillar: 'Wrestlers', postedAt: '2025-01-10T16:20:00Z', distanceMi: 4.5, startsAt: '2025-07-24T18:00:00Z', endsAt: '2025-07-24T20:00:00Z', applied: true },
  { id: '2', title: 'Looking for new wrestlers', date: 'July 24th', time: '6:00 – 8:00 PM EDT', venue: 'Main Room', priceFrom: '$12.00', miles: 2.1, pillar: 'Comedians', postedAt: '2025-01-10T10:30:00Z', distanceMi: 2.1, startsAt: '2025-07-24T19:00:00Z', endsAt: '2025-07-24T22:00:00Z', invited: true },
  { id: '3', title: 'Boxing match referee needed', date: 'July 25th', time: '7:00 – 9:00 PM EDT', venue: 'Madison Square Garden', priceFrom: '$25.00', miles: 8.2, pillar: 'Referees', postedAt: '2025-01-10T08:15:00Z', distanceMi: 8.2, startsAt: '2025-07-25T19:00:00Z', endsAt: '2025-07-25T21:00:00Z' },
  { id: '4', title: 'Ring announcer for local event', date: 'July 26th', time: '5:00 – 7:00 PM EDT', venue: 'Local Arena', priceFrom: '$15.50', miles: 12.5, pillar: 'Ring Announcers', postedAt: '2025-01-09T14:30:00Z', distanceMi: 12.5, startsAt: '2025-07-26T17:00:00Z', endsAt: '2025-07-26T19:00:00Z', applied: true },
  { id: '5', title: 'Comedy open mic night', date: 'Aug 2nd', time: '7:00 – 10:00 PM EDT', venue: 'Comedy Club', priceFrom: '$8.00', miles: 42, pillar: 'Comedians', postedAt: '2025-01-08T12:00:00Z', distanceMi: 42, startsAt: '2025-08-02T19:00:00Z', endsAt: '2025-08-02T22:00:00Z' },
  { id: '6', title: 'Regional boxing spar', date: 'Aug 9th', time: '5:00 – 8:00 PM EDT', venue: 'Boxing Gym', priceFrom: '$20.00', miles: 73, pillar: 'Boxers', postedAt: '2025-01-07T09:30:00Z', distanceMi: 73, startsAt: '2025-08-09T17:00:00Z', endsAt: '2025-08-09T20:00:00Z' },
  // Past events
  { id: '7', title: 'Wrestling match last week', date: 'Jan 5th', time: '7:00 – 9:00 PM EDT', venue: 'Old Arena', priceFrom: '$15.00', miles: 5.2, pillar: 'Wrestlers', postedAt: '2024-12-20T10:00:00Z', distanceMi: 5.2, startsAt: '2025-01-05T19:00:00Z', endsAt: '2025-01-05T21:00:00Z', applied: true },
  { id: '8', title: 'Comedy show last month', date: 'Dec 15th', time: '8:00 – 10:00 PM EDT', venue: 'Comedy Club', priceFrom: '$10.00', miles: 3.1, pillar: 'Comedians', postedAt: '2024-11-25T14:00:00Z', distanceMi: 3.1, startsAt: '2024-12-15T20:00:00Z', endsAt: '2024-12-15T22:00:00Z', applied: true },
];

const DEFAULT_FILTERS: Filters = {
  categories: [],          // empty => all
  time: undefined,         // undefined => any time
  maxMiles: 50,           // <= THIS is the default distance gate
};

// Tab Components
const UpcomingTab: React.FC = () => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  const toggleFav = (id: string) =>
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));

  const formatMiles = (miles?: number) => {
    if (typeof miles === 'number') {
      return `${miles.toFixed(1)} miles away`;
    }
    return '';
  };

  function timeAgo(iso: string) {
    const now = Date.now();
    const then = new Date(iso).getTime();
    const diffMs = Math.max(0, now - then);
    const mins = Math.floor(diffMs / 60000);
    if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  const navigateToEventDetail = () => {
    console.log('Navigate to event detail');
  };

  const renderEvent = ({ item }: { item: EventItem }) => {
    const milesLine = formatMiles(item.miles);
    
    return (
      <Pressable 
        style={styles.card} 
        onPress={navigateToEventDetail}
      >
        <View style={{ position: 'relative', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
          <Image source={{ uri: 'https://picsum.photos/800/600?random=' + item.id }} style={styles.cardImage} />
          
          {/* Posted badge */}
          <View style={styles.postedBadge}>
            <Text style={styles.postedText}>{timeAgo(item.postedAt)}</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.cardActions}>
            <Pressable style={styles.iconBtn} hitSlop={10}>
              <Ionicons name="share-outline" size={20} color="#111" />
            </Pressable>
            <Pressable 
              style={styles.iconBtn} 
              hitSlop={10}
              onPress={() => toggleFav(item.id)}
            >
              <Ionicons 
                name={favorites[item.id] ? "heart" : "heart-outline"} 
                size={22} 
                color={favorites[item.id] ? "#EF4444" : "#111"} 
              />
            </Pressable>
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {/* Pillar chip */}
          <PillarChip label={item.pillar} />
          
          {/* Title */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Meta info */}
          <Text style={styles.cardMeta}>
            {item.date} {item.time} • {item.venue}
          </Text>

          {/* Miles */}
          {milesLine ? (
            <Text style={styles.cardMeta}>
              {milesLine}
            </Text>
          ) : null}

          {/* CTA */}
          <Pressable 
            style={styles.cardCta}
            onPress={navigateToEventDetail}
          >
            <Text style={styles.cardCtaText}>View for more details</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const upcomingEvents = MOCK_EVENTS.filter(event => {
    const now = new Date();
    return new Date(event.endsAt) >= now;
  });

  return (
    <FlatList 
      data={upcomingEvents}
      keyExtractor={i => i.id}
      renderItem={renderEvent}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      contentContainerStyle={{ padding: 16, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No upcoming gigs</Text>
          <Text style={styles.emptyStateSubtitle}>
            Try adjusting your filters or check back later
          </Text>
        </View>
      )}
    />
  );
};

const PastTab: React.FC = () => {
  const pastEvents = MOCK_EVENTS.filter(event => {
    const now = new Date();
    return new Date(event.endsAt) < now && !!event.applied;
  });

  return (
    <FlatList 
      data={pastEvents}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <PillarChip label={item.pillar} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.date} {item.time} • {item.venue}
            </Text>
          </View>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      contentContainerStyle={{ padding: 16, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No past gigs</Text>
          <Text style={styles.emptyStateSubtitle}>
            Gigs you've applied to will appear here
          </Text>
        </View>
      )}
    />
  );
};

const InvitesTab: React.FC = () => {
  const inviteEvents = MOCK_EVENTS.filter(event => !!event.invited);

  return (
    <FlatList 
      data={inviteEvents}
      keyExtractor={i => i.id}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={{ padding: 16 }}>
            <PillarChip label={item.pillar} />
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>
              {item.date} {item.time} • {item.venue}
            </Text>
          </View>
        </View>
      )}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      contentContainerStyle={{ padding: 16, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={() => (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateTitle}>No invites</Text>
          <Text style={styles.emptyStateSubtitle}>
            Invitations from promoters will appear here
          </Text>
        </View>
      )}
    />
  );
};

const MyEventsTab: React.FC = () => (
  <View style={styles.emptyState}>
    <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
    <Text style={styles.emptyStateTitle}>No events yet</Text>
    <Text style={styles.emptyStateSubtitle}>
      "No events yet — create your first one!"
    </Text>
  </View>
);

const CandidatesTab: React.FC = () => (
  <View style={styles.emptyState}>
    <Ionicons name="people-outline" size={48} color="#9CA3AF" />
    <Text style={styles.emptyStateTitle}>No candidates yet</Text>
    <Text style={styles.emptyStateSubtitle}>
      Candidates will appear here when they apply to your events.
    </Text>
  </View>
);

export default function GigScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useUserRole();
  
  const [city, setCity] = useState<City | null>(null);
  const [pickVisible, setPickVisible] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // The active, applied filters:
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  
  // The draft filters while the sheet is open (drives live preview count & pill text "Filters active"):
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  
  // Determine if user is a promoter
  const isPromoter = role === 'promoter';
  
  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem('selectedCity');
      if (v) {
        // Convert stored string to City object
        setCity({ id: 'stored', name: v, region: undefined });
      }
    })();
  }, []);

  const filtersAreDefault =
    (filters.maxMiles === DEFAULT_FILTERS.maxMiles) &&
    (filters.time === DEFAULT_FILTERS.time) &&
    (!filters.categories?.length);

  // Live preview count while the sheet is open (DRAFT)
  const previewCount = useMemo(() => {
    return MOCK_EVENTS.length; // Simplified for now
  }, [draft]);

  /** -------------------------
   * Sticky search header
   * ------------------------ */
  const StickySearchBar = () => (
    <View
      style={[
        styles.stickyWrap,
        { paddingTop: insets.top + 2 } // minimal padding to ensure tab view is touchable
      ]}
    >
      <View style={styles.searchRow}>
        {/* Avatar */}
        <Image
          source={{ uri: 'https://i.pravatar.cc/60' }}
          style={styles.avatar}
        />

        {/* Search */}
        <Pressable
          onPress={() => setPickVisible(true)}
          style={styles.searchInput}
          accessibilityRole="button"
        >
          <Ionicons name="search-outline" size={18} color="#6B7280" />
          <Text style={styles.searchPlaceholder} numberOfLines={1}>
            {isPromoter ? 'Invite Talent' : `Find gigs in ${city ? city.name : 'San Francisco'}`}
          </Text>
        </Pressable>

        {/* Filter */}
        <Pressable onPress={() => setFilterOpen(true)} style={[styles.iconBtn, !filtersAreDefault && styles.iconBtnActive]}>
          <Ionicons name="filter-outline" size={22} color={!filtersAreDefault ? "#fff" : "#111"} />
        </Pressable>

        {/* Messages */}
        <Pressable onPress={() => router.push('/screen/privatemessages')} style={styles.iconBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#111" />
        </Pressable>
      </View>

      {/* Active filters indicator */}
      {!filtersAreDefault && (
        <View style={styles.activeFiltersRow}>
          <Text style={styles.activeFiltersText}>Filters active</Text>
          <Pressable onPress={() => {
            setFilters(DEFAULT_FILTERS);
            setDraft(DEFAULT_FILTERS);
          }} hitSlop={8}>
            <Text style={styles.clearFiltersText}>Clear</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      {/* Scroll only the search + prep */}
      <ScrollView 
        stickyHeaderIndices={[0]} 
        contentContainerStyle={{ paddingBottom: 0 }} 
        showsVerticalScrollIndicator={false}
      >
        <StickySearchBar />
        
        <View style={styles.body}>
          <View style={[styles.gigPrepContainer, { marginBottom: 0, paddingBottom: 0 }]}>
            <GigPrepPanel
              slides={[
                { title: 'Profile updated', subtitle: 'Add more details from your profile page at any time.' },
                { title: 'Add your skills', subtitle: 'Tell promoters what you do best to improve matches.' },
                { title: 'Verify your email', subtitle: 'Keep your account secure and recoverable.' },
                { title: 'Set your availability', subtitle: 'Let others know when you\'re open to new gigs.' },
              ]}
              completedCount={2}
              totalCount={4}
            />
          </View>
        </View>
      </ScrollView>

      {/* Tabs should be OUTSIDE scrollview */}
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarActiveTintColor: '#111',
          tabBarInactiveTintColor: '#6B7280',
        }}
      >
        {role === 'talent' ? (
          <>
            <Tab.Screen name="Upcoming" component={UpcomingTab} />
            <Tab.Screen name="Past" component={PastTab} />
            <Tab.Screen name="Invites" component={InvitesTab} />
          </>
        ) : (
          <>
            <Tab.Screen name="My Events" component={MyEventsTab} />
            <Tab.Screen name="Candidates" component={CandidatesTab} />
          </>
        )}
      </Tab.Navigator>

      <PickLocationSheet 
        visible={pickVisible}
        onClose={() => setPickVisible(false)}
        onDone={(picked) => {
          if (picked) {
            setCity(picked);
            AsyncStorage.setItem('selectedCity', picked.name);
            setPickVisible(false);
          } else {
            setPickVisible(false);
          }
        }}
        title="Choose your location"
        initial={city}
      />

      {/* Filter sheet — use the DRAFT value, show LIVE result count, and apply/clear handlers */}
      <FilterBottomSheet
        visible={filterOpen}
        value={draft}
        resultCount={previewCount}
        onChange={(next) => setDraft(next)}               // live updates while user edits
        onApply={(finalVal) => {                          // Done button
          setFilters(finalVal);
          setDraft(finalVal);
          setFilterOpen(false);
        }}
        onClose={() => setFilterOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  stickyWrap: {
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingBottom: 10,
    // make sure it sits above scrolling content
    zIndex: 10,
    elevation: 6, // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: { width: 34, height: 34, borderRadius: 17 },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchPlaceholder: { color: '#6B7280', fontSize: 15, flexShrink: 1 },
  iconBtn: { 
    height: 36, 
    width: 36, 
    borderRadius: 18, 
    backgroundColor: '#FFFFFF', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  iconBtnActive: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  activeFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  activeFiltersText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  clearFiltersText: {
    fontSize: 12,
    color: '#111',
    fontWeight: '600',
  },
  body: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 0, marginBottom: 0 },
  gigPrepContainer: {
    marginBottom: 0, // No spacing between GigPrepPanel and tabs
    paddingBottom: 0, // Override GigPrepPanel's internal padding
  },

  // Tab bar styles
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginTop: 0,
    marginBottom: 0,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'none',
  },
  tabIndicator: {
    backgroundColor: '#111',
    height: 2,
  },

  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  cardImage: { width: '100%', height: 220 },
  cardActions: { position: 'absolute', right: 8, top: 8, flexDirection: 'row', gap: 8 },
  postedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // subtle shadow (iOS+Android)
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  postedText: { fontSize: 12, fontWeight: '600', color: '#111' },
  cardTitle: { fontSize: 22, fontWeight: '800', color: '#111', marginTop: 10 },
  cardMeta: { color: '#6B7280', marginTop: 4 },
  cardCta: { alignSelf: 'flex-start', marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#F3F4F6', borderRadius: 10 },
  cardCtaText: { fontWeight: '700', color: '#111' },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: BG,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginTop: 20,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
