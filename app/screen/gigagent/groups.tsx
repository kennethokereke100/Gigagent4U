import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GroupFilter from '../../../components/GroupFilter';

const BG = '#F5F3F0';

const AVATAR =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop';

type Pillar = 'Wrestling' | 'MMA' | 'Boxing' | 'Comedy' | 'Music' | 'Others';
type Group = { id: string; name: string; image: string; members: number; type: 'Public' | 'Private'; pillar: string; distance: number };

type Filters = {
  pillars: Pillar[];
  maxDistance: number;
};

const GROUPS: Group[] = [
  { id: '1', name: 'Comedians Circle', image: 'https://images.unsplash.com/photo-1523246191915-37c7af7a78b3?w=300&q=80&fit=crop', members: 5240, type: 'Public', pillar: 'Comedy', distance: 2.3 },
  { id: '2', name: 'Wrestling Coalition', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&q=80&fit=crop', members: 3120, type: 'Private', pillar: 'Wrestling', distance: 8.7 },
  { id: '3', name: 'Boxing League', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=300&q=80&fit=crop', members: 7810, type: 'Public', pillar: 'Boxing', distance: 15.2 },
  { id: '4', name: 'MMA Pros', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&q=80&fit=crop', members: 8620, type: 'Public', pillar: 'MMA, Boxing', distance: 43.2 },
  { id: '5', name: 'Standup Stars', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80&fit=crop', members: 1940, type: 'Private', pillar: 'Comedy', distance: 5.1 },
  { id: '6', name: 'Indie Musicians', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80&fit=crop', members: 12980, type: 'Public', pillar: 'Music', distance: 12.8 },
  { id: '7', name: 'Club Promoters', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80&fit=crop', members: 4020, type: 'Public', pillar: 'Promotion', distance: 28.4 },
  { id: '8', name: 'Referees United', image: 'https://images.unsplash.com/photo-1541534401786-2077eed87a72?w=300&q=80&fit=crop', members: 980, type: 'Private', pillar: 'Referees', distance: 67.9 },
  { id: '9', name: 'Ring Announcers Hub', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&q=80&fit=crop', members: 560, type: 'Public', pillar: 'Announcing', distance: 34.6 },
  { id: '10', name: 'Cutmen Crew', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80&fit=crop', members: 310, type: 'Private', pillar: 'Medical', distance: 89.2 },
];

export default function Groups() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState<Filters>({ pillars: [], maxDistance: 25 });

  const filtered = useMemo(() => {
    let result = GROUPS;
    
    // Apply search filter
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(g => g.name.toLowerCase().includes(q));
    }
    
    // Apply pillar filter
    if (filters.pillars.length > 0) {
      result = result.filter(g => 
        filters.pillars.some(pillar => 
          g.pillar.toLowerCase().includes(pillar.toLowerCase())
        )
      );
    }
    
    // Apply distance filter
    if (filters.maxDistance > 0) {
      result = result.filter(g => g.distance <= filters.maxDistance);
    }
    
    return result;
  }, [query, filters]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const formatDistance = (distance: number): string => {
    return `${Math.round(distance)} mi`;
  };

  // Check if filters are active
  const hasActiveFilters = filters.pillars.length > 0 || filters.maxDistance !== 25;

  const renderItem = ({ item }: { item: Group }) => (
    <Pressable
      onPress={() => router.push('/screen/gigagent/groupdetail')}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.rowImageContainer}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.rowImage}
          defaultSource={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80&fit=crop' }}
          onError={() => {
            // Fallback to a default image if the main image fails
            console.log(`Failed to load image for ${item.name}`);
          }}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <View style={styles.pillarContainer}>
          <Text style={styles.pillarLabel}>{item.pillar}</Text>
        </View>
        <Text style={styles.rowMeta}>
          {item.type} • {Intl.NumberFormat().format(item.members)} members • {formatDistance(item.distance)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.title}>Groups</Text>

        <View style={styles.searchRow}>
          <Image source={{ uri: AVATAR }} style={styles.avatar} />
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Find group name"
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
          <TouchableOpacity 
            style={[
              styles.iconBtn, 
              hasActiveFilters && styles.iconBtnActive
            ]} 
            onPress={() => setFilterVisible(true)}
          >
            <Ionicons 
              name="options-outline" 
              size={22} 
              color={hasActiveFilters ? '#FFF' : '#111'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No groups found</Text>
            <Text style={styles.emptyStateSubtitle}>Try adjusting your filters</Text>
          </View>
        }
      />

      <GroupFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApply={setFilters}
        initialFilters={filters}
        resultCount={filtered.length}
        onFiltersChange={handleFiltersChange}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 16, paddingBottom: 12, gap: 12, backgroundColor: BG },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  searchBox: {
    flex: 1,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconBtnActive: {
    backgroundColor: '#000',
  },

  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowImageContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rowImage: { width: '100%', height: '100%', borderRadius: 8 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  rowMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  pillarContainer: {
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  pillarLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#06B6D4',
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
