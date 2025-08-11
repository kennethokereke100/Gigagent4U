import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GigPrepPanel from '../../components/GigPrepPanel';
import { PickLocationSheet } from '../picklocation';

const BG = '#F5F3F0';

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  priceFrom: string;
};

const MOCK_EVENTS: EventItem[] = [
  { id: '1', title: 'Looking for new wrestlers', date: 'July 24th', time: '6:00 – 8:00 PM EDT', venue: 'El Rio', priceFrom: '$17.85' },
  { id: '2', title: 'Looking for new wrestlers', date: 'July 24th', time: '6:00 – 8:00 PM EDT', venue: 'Main Room', priceFrom: '$12.00' },
];

export default function GigScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [city, setCity] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const v = await AsyncStorage.getItem('selectedCity');
      if (v) setCity(v);
    })();
  }, []);

  const toggleFav = (id: string) =>
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));

  const navigateToEventDetail = () => {
    router.push({
      pathname: '/screen/eventdetail',
      params: {
        title: 'Looking for New Wrestlers',
        dateLine: 'Wed, July 24 • 6:00 – 8:00 PM EDT',
        venue: '1010 Nicollet Mall, Minneapolis, MN 55403, USA',
        promoterName: 'Allison Perez',
        promoterRole: 'Promoter',
        groupName: 'Jana Nyberg Group',
        priceText: 'From $120',
        city: city || 'New York City',
        heroUri: 'https://picsum.photos/seed/gig/800/480'
      }
    });
  };

  const renderEvent = ({ item }: { item: EventItem }) => (
    <Pressable 
      style={styles.card} 
      onPress={navigateToEventDetail}
    >
      <View style={styles.cardImageWrap}>
        <Image
          source={{ uri: 'https://picsum.photos/seed/gig/800/480' }}
          style={styles.cardImage}
        />
        <View style={styles.cardActions}>
          <Pressable style={styles.iconBtn} onPress={() => {}}>
            <Ionicons name="share-outline" size={18} color="#111" />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => toggleFav(item.id)}>
            <Ionicons
              name={favorites[item.id] ? 'heart' : 'heart-outline'}
              size={18}
              color={favorites[item.id] ? '#e11d48' : '#111'}
            />
          </Pressable>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: '800', color: '#111', marginBottom: 6 }}>
          Looking for new wrestlers
        </Text>

        <Text style={{ color: '#6B7280', marginBottom: 8 }}>
          July 24th 6:00 – 8:00 PM EDT
        </Text>

        <Pressable
          onPress={navigateToEventDetail}
          style={({ pressed }) => ({
            alignSelf: 'flex-start',
            paddingVertical: 6,
            paddingHorizontal: 10,
            borderRadius: 8,
            backgroundColor: pressed ? '#ECECEC' : '#F4F4F4',
          })}
          accessibilityRole="button"
        >
          <Text style={{ color: '#111', fontWeight: '600' }}>View for more details</Text>
        </Pressable>
      </View>
    </Pressable>
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: BG }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header search */}
      <View style={[styles.row, { paddingTop: insets.top + 8 }]}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/60' }}
          style={styles.avatar}
        />
        <Pressable style={styles.searchWrap} onPress={() => setPickerOpen(true)}>
          <Ionicons name="search-outline" size={18} color="#6B7280" />
          <Text style={styles.searchPlaceholder}>
            Find gigs in {city || 'San Francisco'}
          </Text>
        </Pressable>
        <Pressable style={styles.actionIcon} onPress={() => {}}>
          <Ionicons name="filter-outline" size={22} color="#111" />
        </Pressable>
        <Pressable style={styles.actionIcon} onPress={() => {}}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#111" />
        </Pressable>
      </View>

      {/* Prepare section */}
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

      {/* Events */}
      <FlatList
        scrollEnabled={false}
        data={MOCK_EVENTS}
        keyExtractor={i => i.id}
        renderItem={renderEvent}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
      />

      <PickLocationSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onDone={(pickedCity: string | null) => {
          if (pickedCity) {
            const cityOnly = pickedCity.split(',')[0].trim();
            setCity(cityOnly);
            AsyncStorage.setItem('selectedCity', cityOnly);
          }
          setPickerOpen(false);
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: BG,
  },
  avatar: { width: 34, height: 34, borderRadius: 17 },
  searchWrap: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchPlaceholder: { flex: 1, fontSize: 15, color: '#6B7280' },
  actionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  card: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  cardImageWrap: { position: 'relative' },
  cardImage: { width: '100%', height: 180 },
  cardActions: { position: 'absolute', right: 8, top: 8, flexDirection: 'row', gap: 8 },
  iconBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
});
