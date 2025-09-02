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
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import FilterBottomSheet from '../../../components/FilterBottomSheet';
import PickLocationSheet from '../../../components/PickLocationSheet';
import PillarChip from '../../../components/PillarChip';
import { useUserRole } from '../../../contexts/UserRoleContext';
import GoalsSection from '../../components/GoalsSection';

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

// Shared utility function to parse date strings like "Jan 5th", "Dec 15th"
const parseEventDate = (dateStr: string): Date => {
  const now = new Date();
  const currentYear = now.getFullYear();
  
  // Map month abbreviations to numbers
  const monthMap: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  // Extract month and day from "Jan 5th" format
  const parts = dateStr.split(' ');
  const month = monthMap[parts[0]];
  const day = parseInt(parts[1].replace(/\D/g, '')); // Remove "th", "st", "nd", "rd"
  
  // Create date object - assume current year unless it's a past month
  let year = currentYear;
  const eventDate = new Date(year, month, day);
  
  // If the event date is in the future but the month is in the past, it's from last year
  if (eventDate > now && month < now.getMonth()) {
    year = currentYear - 1;
    return new Date(year, month, day);
  }
  
  return eventDate;
};

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
  { id: '9', title: 'Boxing championship event', date: 'Dec 10th', time: '6:00 – 9:00 PM EDT', venue: 'Sports Complex', priceFrom: '$45.00', miles: 8.7, pillar: 'Boxers', postedAt: '2024-11-15T09:00:00Z', distanceMi: 8.7, startsAt: '2024-12-10T18:00:00Z', endsAt: '2024-12-10T21:00:00Z' },
  { id: '10', title: 'Ring announcer needed', date: 'Nov 28th', time: '7:00 – 8:30 PM EDT', venue: 'Local Gym', priceFrom: '$18.00', miles: 2.3, pillar: 'Ring Announcers', postedAt: '2024-11-10T16:30:00Z', distanceMi: 2.3, startsAt: '2024-11-28T19:00:00Z', endsAt: '2024-11-28T20:30:00Z' },
  { id: '11', title: 'Comedy open mic night', date: 'Nov 20th', time: '8:00 – 11:00 PM EDT', venue: 'Laugh Factory', priceFrom: '$12.00', miles: 6.1, pillar: 'Comedians', postedAt: '2024-11-05T12:00:00Z', distanceMi: 6.1, startsAt: '2024-11-20T20:00:00Z', endsAt: '2024-11-20T23:00:00Z' },
  { id: '12', title: 'Wrestling training session', date: 'Nov 15th', time: '5:00 – 7:00 PM EDT', venue: 'Training Center', priceFrom: '$22.00', miles: 4.8, pillar: 'Wrestlers', postedAt: '2024-10-30T14:00:00Z', distanceMi: 4.8, startsAt: '2024-11-15T17:00:00Z', endsAt: '2024-11-15T19:00:00Z' },
];

const DEFAULT_FILTERS: Filters = {
  categories: [],          // empty => all
  time: undefined,         // undefined => any time
  maxMiles: 50,           // <= THIS is the default distance gate
};





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
  
  // Track if goals banner is dismissed
  const [goalsBannerDismissed, setGoalsBannerDismissed] = useState(false);
  

  
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

  // Handle goal press
  const handleGoalPress = (goalId: string) => {
    console.log('Goal pressed:', goalId);
    // TODO: Navigate to appropriate screen based on goalId
  };

  // Handle goals banner dismiss
  const handleGoalsBannerDismiss = () => {
    setGoalsBannerDismissed(true);
  };

  // Handle FAB press
  const handleFABPress = () => {
    router.push('/screen/CreateEvent');
  };



  /** -------------------------
   * Data filtering for tabs
   * ------------------------ */
  // Helper function to parse date strings like "Jan 5th", "Dec 15th"
  const parseEventDate = (dateStr: string): Date => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Map month abbreviations to numbers
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    // Extract month and day from "Jan 5th" format
    const parts = dateStr.split(' ');
    const month = monthMap[parts[0]];
    const day = parseInt(parts[1].replace(/\D/g, '')); // Remove "th", "st", "nd", "rd"
    
    // Create date object - assume current year unless it's a past month
    let year = currentYear;
    const eventDate = new Date(year, month, day);
    
    // If the event date is in the future but the month is in the past, it's from last year
    if (eventDate > now && month < now.getMonth()) {
      year = currentYear - 1;
      return new Date(year, month, day);
    }
    
    return eventDate;
  };

  const upcomingEvents = MOCK_EVENTS.filter(event => {
    const eventDate = parseEventDate(event.date);
    const now = new Date();
    return eventDate >= now;
  });

  const pastEvents = MOCK_EVENTS.filter(event => {
    const eventDate = parseEventDate(event.date);
    const now = new Date();
    return eventDate < now && !!event.applied;
  });

  const inviteEvents = MOCK_EVENTS.filter(event => !!event.invited);

  // Render event function for upcoming tab
  const renderEvent = ({ item }: { item: EventItem }) => {
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

  /** -------------------------
   * Tab wrapper components with GoalsSection
   * ------------------------ */
  const UpcomingTabWithGoals = () => (
    <FlatList 
      data={upcomingEvents}
      keyExtractor={i => i.id}
      renderItem={renderEvent}
      ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      contentContainerStyle={{ padding: 16, paddingTop: 8 }}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
      ListHeaderComponent={() => (
        !goalsBannerDismissed ? (
          <View style={{ marginBottom: 16 }}>
            <GoalsSection 
              onGoalPress={handleGoalPress} 
              onDismiss={handleGoalsBannerDismiss}
            />
          </View>
        ) : null
      )}
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

  const PastTabWithGoals = () => (
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
      style={{ flex: 1 }}
      ListHeaderComponent={() => (
        !goalsBannerDismissed ? (
          <View style={{ marginBottom: 16 }}>
            <GoalsSection 
              onGoalPress={handleGoalPress} 
              onDismiss={handleGoalsBannerDismiss}
            />
          </View>
        ) : null
      )}
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

  const InvitesTabWithGoals = () => (
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
      style={{ flex: 1 }}
      ListHeaderComponent={() => (
        !goalsBannerDismissed ? (
          <View style={{ marginBottom: 16 }}>
            <GoalsSection 
              onGoalPress={handleGoalPress} 
              onDismiss={handleGoalsBannerDismiss}
            />
          </View>
        ) : null
      )}
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

  const MyEventsTabWithGoals = () => (
    <View style={{ flex: 1 }}>
      {!goalsBannerDismissed && (
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
          <GoalsSection 
            onGoalPress={handleGoalPress} 
            onDismiss={handleGoalsBannerDismiss}
          />
        </View>
      )}
      <View style={styles.myEventsEmptyState}>
        <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyStateTitle}>No events yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          "No events yet — create your first one!"
        </Text>
      </View>
    </View>
  );

  const CandidatesTabWithGoals = () => (
    <View style={{ flex: 1 }}>
      {!goalsBannerDismissed && (
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
          <GoalsSection 
            onGoalPress={handleGoalPress} 
            onDismiss={handleGoalsBannerDismiss}
          />
        </View>
      )}
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={48} color="#9CA3AF" />
        <Text style={styles.emptyStateTitle}>No candidates yet</Text>
        <Text style={styles.emptyStateSubtitle}>
          Candidates will appear here when they apply to your events.
        </Text>
      </View>
    </View>
  );

  const PastEventsTabWithGoals = () => {
    const router = useRouter();
    
    // Always show mock past events (IDs 7-12) for dummy data visibility
    const pastEvents = MOCK_EVENTS.filter(event => {
      const isPastEvent = ['7', '8', '9', '10', '11', '12'].includes(event.id);
      console.log(`Event ${event.id}: ${event.title} - isPastEvent: ${isPastEvent}`);
      return isPastEvent;
    });
    
    console.log(`PastEventsTab: Found ${pastEvents.length} past events`);

    const renderPastEvent = ({ item }: { item: EventItem }) => (
      <Pressable 
        style={styles.card} 
        onPress={() => {
          router.push({
            pathname: '/screen/Eventdetail',
            params: {
              title: item.title,
              dateLine: `${item.date} • ${item.time}`,
              venue: item.venue,
              priceText: `Gig Price: ${item.priceFrom}`,
              city: item.venue,
            }
          });
        }}
      >
        {/* Event Image */}
        <Image
          source={{ uri: 'https://picsum.photos/seed/' + item.id + '/400/200' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        {/* Category Pillar */}
        <View style={styles.cardActions}>
          <PillarChip label={item.pillar} />
        </View>
        
        {/* Posted Badge */}
        <View style={styles.postedBadge}>
          <Text style={styles.postedText}>Posted</Text>
        </View>
        
        {/* Event Details */}
        <View style={{ padding: 16 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMeta}>
            {item.date} {item.time} • {item.venue}
          </Text>
          <Text style={styles.cardMeta}>
            {item.distanceMi.toFixed(1)} miles away
          </Text>
        </View>
      </Pressable>
    );

    return (
      <FlatList 
        data={pastEvents}
        keyExtractor={i => i.id}
        renderItem={renderPastEvent}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        ListHeaderComponent={() => (
          !goalsBannerDismissed ? (
            <View style={{ marginBottom: 16 }}>
              <GoalsSection 
                onGoalPress={handleGoalPress} 
                onDismiss={handleGoalsBannerDismiss}
              />
            </View>
          ) : null
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No past events</Text>
            <Text style={styles.emptyStateSubtitle}>
              Your past events will appear here once they're completed.
            </Text>
          </View>
        )}
      />
    );
  };

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
        <Pressable onPress={() => router.push('/screen/Privatemessages')} style={styles.iconBtn}>
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

      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <StickySearchBar />
      </View>

      {/* Tab content area */}
      <View style={styles.tabContentArea}>
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
                    <Tab.Screen name="Upcoming" component={UpcomingTabWithGoals} />
                    <Tab.Screen name="Past" component={PastTabWithGoals} />
                    <Tab.Screen name="Invites" component={InvitesTabWithGoals} />
                  </>
                ) : (
                  <>
                    <Tab.Screen name="My Events" component={MyEventsTabWithGoals} />
                    <Tab.Screen name="Candidates" component={CandidatesTabWithGoals} />
                    <Tab.Screen name="Past Events" component={PastEventsTabWithGoals} />
                  </>
                )}
              </Tab.Navigator>
      </View>

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

      {/* FAB for promoters */}
      {role === 'promoter' && (
        <Pressable style={styles.fab} onPress={handleFABPress}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      )}


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
    paddingBottom: 0,
    // make sure it sits above scrolling content
    zIndex: 10,
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
  stickyHeader: {
    backgroundColor: BG,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  scrollContent: {
    paddingTop: 80, // Reduced spacing between header and content
    paddingHorizontal: 0, // Remove horizontal padding to allow edge-to-edge GoalsSection
  },
  headerWrap: {
    backgroundColor: BG,
    paddingHorizontal: 16,
    paddingBottom: 0,
  },
  tabContentArea: {
    flex: 1,
    marginTop: 80, // Add margin to account for sticky header
  },
  body: { paddingHorizontal: 16, paddingTop: 0, paddingBottom: 0, marginBottom: 0 },

  // Tab bar styles
  tabBar: {
    backgroundColor: '#fff',
    elevation: 6, // Android shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
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
  myEventsEmptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: BG,
    marginTop: 20,
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
  // FAB styles
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1000,
  },


});
