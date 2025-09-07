import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
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
import AddEventBottomSheet from '../../../components/AddEventBottomSheet';
import FilterBottomSheet from '../../../components/FilterBottomSheet';
import PickLocationSheet from '../../../components/PickLocationSheet';
import PillarChip from '../../../components/PillarChip';
import { useUserRole } from '../../../contexts/UserRoleContext';
import { auth, db } from '../../../firebaseConfig';
import GoalsSection from '../../components/GoalsSection';

const Tab = createMaterialTopTabNavigator();

const BG = '#F5F3F0';
const CARD = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT = '#111';
const MUTED = '#6B7280';
const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/gigplaceholder/800/450';

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
  // Additional fields for user-created events
  category?: string;
  description?: string;
  contactInfo?: string;
  gigGroupName?: string;
  photoUri?: string;
  location?: string;
  address?: string;
  hourlyAmount?: string;
  startDate?: string;
  endDate?: string;
  // Firestore fields
  userId?: string;
  type?: string;
  photoUrl?: string;
  contact?: string;
  gigPrice?: number;
  createdAt?: Timestamp;
  // Google Event specific fields
  categories?: string[];
  venueName?: string;
  venueAddress?: string;
  venuePhoto?: string;
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

// Mock events removed - using Firestore posts

const DEFAULT_FILTERS: Filters = {
  categories: [],          // empty => all
  time: undefined,         // undefined => any time
  maxMiles: 50,           // <= THIS is the default distance gate
};





export default function Gig() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useUserRole();
  
  const [city, setCity] = useState<City | null>(null);
  const [pickVisible, setPickVisible] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Add Event Bottom Sheet state
  const [addEventSheetVisible, setAddEventSheetVisible] = useState(false);
  
  // The active, applied filters:
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  
  // The draft filters while the sheet is open (drives live preview count & pill text "Filters active"):
  const [draft, setDraft] = useState<Filters>(DEFAULT_FILTERS);
  
  // Track if goals banner is dismissed
  const [goalsBannerDismissed, setGoalsBannerDismissed] = useState(false);
  
  // Firestore posts
  const [firestorePosts, setFirestorePosts] = useState<EventItem[]>([]);
  
  // Favorites state for events
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  
  // Toggle favorite function
  const toggleFav = (id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Convert Firestore post to EventItem format
  const convertFirestorePostToEventItem = (doc: any): EventItem => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.() || new Date();
    
    return {
      id: doc.id,
      title: data.title || 'Untitled Event',
      date: data.startDate || 'Date TBD',
      time: data.time || 'Time TBD',
      venue: data.address || 'Venue TBD',
      priceFrom: data.gigPrice ? `$${data.gigPrice}` : '$0',
      miles: 0,
      pillar: data.category || 'Event',
      postedAt: createdAt.toISOString(),
      distanceMi: 0,
      startsAt: data.startDate || createdAt.toISOString(),
      endsAt: data.endDate || createdAt.toISOString(),
      // Additional fields
      category: data.category || 'Event',
      description: data.description,
      contactInfo: data.contact,
      gigGroupName: '',
      photoUri: data.photoUrl, // Use photoUrl from Firestore
      location: data.address,
      address: data.address,
      hourlyAmount: data.gigPrice ? `$${data.gigPrice}` : '$0',
      startDate: data.startDate,
      endDate: data.endDate,
      // Firestore fields
      userId: data.userId,
      type: data.type,
      photoUrl: data.photoUrl,
      contact: data.contact,
      gigPrice: data.gigPrice,
      createdAt: data.createdAt,
    };
  };

  // Convert Google Event to EventItem format
  const convertGoogleEventToEventItem = (doc: any): EventItem => {
    const data = doc.data();
    const createdAt = data.createdAt?.toDate?.() || new Date();
    
    return {
      id: doc.id,
      title: data.eventTitle || data.venueName || 'Untitled Venue Event', // Use eventTitle first, fallback to venueName
      date: data.startDate || data.date || 'Date TBD',
      time: data.time || 'Time TBD',
      venue: data.venueAddress || 'Venue TBD',
      priceFrom: data.gigPrice ? `$${data.gigPrice}` : '$0', // Use actual gigPrice if available
      miles: 0,
      pillar: data.category || 'Google Event',
      postedAt: createdAt.toISOString(),
      distanceMi: 0,
      startsAt: data.startDate || data.date || createdAt.toISOString(),
      endsAt: data.endDate || data.date || createdAt.toISOString(),
      // Additional fields
      category: data.category || 'Google Event',
      description: data.description,
      contactInfo: 'Contact TBD',
      gigGroupName: '',
      photoUri: data.venuePhoto || PLACEHOLDER_IMAGE,
      location: data.venueAddress,
      address: data.venueAddress,
      hourlyAmount: data.gigPrice ? `$${data.gigPrice}` : '$0',
      startDate: data.date,
      endDate: data.date,
      // Firestore fields
      userId: data.createdBy,
      type: 'promoter',
      photoUrl: data.venuePhoto,
      contact: 'Contact TBD',
      gigPrice: data.gigPrice || 0,
      createdAt: createdAt,
      // Google Event specific fields
      categories: data.categories || [],
      venueName: data.venueName,
      venueAddress: data.venueAddress,
      venuePhoto: data.venuePhoto,
    };
  };
  
  // Determine if user is a promoter
  const isPromoter = role === 'promoter';
  
  useEffect(() => {
    (async () => {
      // Only load selected city, don't clear events
      const v = await AsyncStorage.getItem('selectedCity');
      if (v) {
        // Convert stored string to City object
        setCity({ id: 'stored', name: v, region: undefined });
      }
    })();
  }, []);

  // Set up Firestore listener for posts and google events with auth check
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("No user logged in, skipping Firestore query");
        setFirestorePosts([]); // Clear posts when user logs out
        return;
      }

      console.log("User authenticated, setting up Firestore listeners");
      
      const postsQuery = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const googleEventsQuery = query(collection(db, "googleevents"), orderBy("createdAt", "desc"));
      
      let allPosts: EventItem[] = [];
      let allGoogleEvents: EventItem[] = [];
      
      const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
        try {
          allPosts = snapshot.docs.map(doc => convertFirestorePostToEventItem(doc));
          mergeAndSortAllEvents();
          console.log('✅ Successfully loaded', allPosts.length, 'posts from Firestore');
        } catch (error) {
          console.error('❌ Error processing Firestore posts:', error);
        }
      }, (error) => {
        console.error('❌ Error listening to Firestore posts:', error);
        
        // More specific error handling
        if (error.code === 'permission-denied') {
          console.error('Permission denied: Check Firestore security rules');
        } else if (error.code === 'unavailable') {
          console.error('Firestore service unavailable');
        } else if (error.code === 'unauthenticated') {
          console.error('User not authenticated');
        }
        
        // Don't clear existing posts on error - keep them visible
      });

      const unsubscribeGoogleEvents = onSnapshot(googleEventsQuery, (snapshot) => {
        try {
          allGoogleEvents = snapshot.docs.map(doc => convertGoogleEventToEventItem(doc));
          mergeAndSortAllEvents();
          console.log('✅ Successfully loaded', allGoogleEvents.length, 'Google events from Firestore');
        } catch (error) {
          console.error('❌ Error processing Google events:', error);
        }
      }, (error) => {
        console.error('❌ Error listening to Google events:', error);
      });

      // Function to merge and sort all events by creation time
      const mergeAndSortAllEvents = () => {
        const combinedEvents = [...allPosts, ...allGoogleEvents];
        
        // Sort by creation time (newest first)
        combinedEvents.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || new Date(a.postedAt);
          const timeB = b.createdAt?.toDate?.() || new Date(b.postedAt);
          return timeB.getTime() - timeA.getTime();
        });
        
        setFirestorePosts(combinedEvents);
      };

      // Store unsubscribe functions to clean up when auth state changes
      return () => {
        unsubscribePosts();
        unsubscribeGoogleEvents();
      };
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // AsyncStorage logic removed - using Firestore posts





  const filtersAreDefault =
    (filters.maxMiles === DEFAULT_FILTERS.maxMiles) &&
    (filters.time === DEFAULT_FILTERS.time) &&
    (!filters.categories?.length);

  // Live preview count while the sheet is open (DRAFT)
  const previewCount = useMemo(() => {
    return firestorePosts.length; // Show count of Firestore posts
  }, [draft, firestorePosts.length]);

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
    setAddEventSheetVisible(true);
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

  // Use Firestore posts for all users, with role-based filtering
  const upcomingEvents = firestorePosts.filter(event => {
    const eventDate = parseEventDate(event.date);
    const now = new Date();
    return eventDate >= now;
  });

  const pastEvents = firestorePosts.filter(event => {
    const eventDate = parseEventDate(event.date);
    const now = new Date();
    return eventDate < now;
  });

  const inviteEvents = role === 'talent'
    ? [] // Talent users don't have invites from Firestore data
    : firestorePosts.filter(event => !!event.invited);

  // Render event function for upcoming tab
  const renderEvent = ({ item }: { item: EventItem }) => {

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
      
      const seconds = Math.floor(diffMs / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      const weeks = Math.floor(days / 7);
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);
      
      if (seconds < 60) return 'Just now';
      if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
      if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
      if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
      if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
      if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    }

    const navigateToEventDetail = () => {
      router.push({
        pathname: '/screen/Eventdetail',
        params: {
          title: item.title,
          dateLine: `${item.date} • ${item.time}`,
          venue: item.venue,
          priceText: `Gig Price: ${item.priceFrom}`,
          city: item.venue,
          // Pass additional data for user-created events
          description: (item as any).description,
          contactInfo: (item as any).contactInfo,
          gigGroupName: (item as any).gigGroupName,
          photoUri: (item as any).photoUri,
          location: (item as any).location,
          address: (item as any).address,
          hourlyAmount: (item as any).hourlyAmount,
          startDate: (item as any).startDate,
          endDate: (item as any).endDate,
          // Firestore fields
          userId: (item as any).userId,
          type: (item as any).type,
          photoUrl: (item as any).photoUrl,
          contact: (item as any).contact,
          gigPrice: (item as any).gigPrice?.toString(),
        }
      });
    };

    const milesLine = formatMiles(item.miles);
    
    return (
      <Pressable 
        style={styles.card} 
        onPress={navigateToEventDetail}
      >
        <View style={{ position: 'relative', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' }}>
          <Image 
            source={{ 
              uri: (item as any).photoUrl || (item as any).photoUri || PLACEHOLDER_IMAGE
            }} 
            style={styles.cardImage} 
            defaultSource={{ uri: PLACEHOLDER_IMAGE }}
            onError={() => {
              // If image fails to load, we could set a state to show a placeholder
              console.log('Image failed to load for event:', item.id);
            }}
          />
          
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
          {/* Category chip */}
          <PillarChip label={item.category || item.pillar} />
          
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
          <Text style={styles.emptyStateTitle}>
            {role === 'talent' ? 'No gigs available' : 'No upcoming gigs'}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {role === 'talent' 
              ? 'No promoter events have been posted yet' 
              : 'Try adjusting your filters or check back later'
            }
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
          <Text style={styles.emptyStateTitle}>
            {role === 'talent' ? 'No past gigs' : 'No past gigs'}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {role === 'talent' 
              ? 'No past promoter events available' 
              : 'Gigs you\'ve applied to will appear here'
            }
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
          <Text style={styles.emptyStateTitle}>
            {role === 'talent' ? 'No invites' : 'No invites'}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {role === 'talent' 
              ? 'No invitations available yet' 
              : 'Invitations from promoters will appear here'
            }
          </Text>
        </View>
      )}
    />
  );

  const MyEventsTabWithGoals = () => {
    const router = useRouter();
    
    // Filter events to show only the current user's events for promoters
    const myEvents = role === 'promoter' 
      ? firestorePosts.filter(event => event.userId === auth.currentUser?.uid)
      : firestorePosts; // Talent users see all events
    
    if (myEvents.length === 0) {
      return (
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
            <Text style={styles.emptyStateTitle}>No gigs yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Create an event to see your posts here.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <FlatList
        data={myEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          !goalsBannerDismissed ? (
            <View style={{ paddingBottom: 16 }}>
              <GoalsSection 
                onGoalPress={handleGoalPress} 
                onDismiss={handleGoalsBannerDismiss}
              />
            </View>
          ) : null
        }
      />
    );
  };

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
    
    // For promoters: always show empty state for now
    // For talents: show all past events
    if (role === 'promoter') {
      return (
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
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No past events</Text>
            <Text style={styles.emptyStateSubtitle}>
              Past events will appear here when they're completed
            </Text>
          </View>
        </View>
      );
    }
    
    // For talents: show all past events
    if (pastEvents.length === 0) {
      return (
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
            <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No past events</Text>
            <Text style={styles.emptyStateSubtitle}>
              Past events will appear here when they're completed
            </Text>
          </View>
        </View>
      );
    }

    return (
      <FlatList
        data={pastEvents}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          !goalsBannerDismissed ? (
            <View style={{ paddingBottom: 16 }}>
              <GoalsSection 
                onGoalPress={handleGoalPress} 
                onDismiss={handleGoalsBannerDismiss}
              />
            </View>
          ) : null
        }
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
                        id={undefined}
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

              {/* Add Event Bottom Sheet */}
        <AddEventBottomSheet
          visible={addEventSheetVisible}
          onClose={() => setAddEventSheetVisible(false)}
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
