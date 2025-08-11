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

const BG = '#F5F3F0';

const AVATAR =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop';

type Group = { id: string; name: string; image: string; members: number; type: 'Public' | 'Private' };
const GROUPS: Group[] = [
  { id: '1', name: 'Comedians Circle', image: 'https://images.unsplash.com/photo-1523246191915-37c7af7a78b3?w=300&q=80', members: 5240, type: 'Public' },
  { id: '2', name: 'Wrestling Coalition', image: 'https://images.unsplash.com/photo-1521417531039-94f0e7b0b49c?w=300&q=80', members: 3120, type: 'Private' },
  { id: '3', name: 'Boxing League', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=300&q=80', members: 7810, type: 'Public' },
  { id: '4', name: 'MMA Pros', image: 'https://images.unsplash.com/photo-1521417531039-94f0e7b0b49c?w=300&q=80', members: 8620, type: 'Public' },
  { id: '5', name: 'Standup Stars', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80', members: 1940, type: 'Private' },
  { id: '6', name: 'Indie Musicians', image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&q=80', members: 12980, type: 'Public' },
  { id: '7', name: 'Club Promoters', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80', members: 4020, type: 'Public' },
  { id: '8', name: 'Referees United', image: 'https://images.unsplash.com/photo-1541534401786-2077eed87a72?w=300&q=80', members: 980, type: 'Private' },
  { id: '9', name: 'Ring Announcers Hub', image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300&q=80', members: 560, type: 'Public' },
  { id: '10', name: 'Cutmen Crew', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=80', members: 310, type: 'Private' },
];

export default function Groups() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return GROUPS;
    return GROUPS.filter(g => g.name.toLowerCase().includes(q));
  }, [query]);

  const renderItem = ({ item }: { item: Group }) => (
    <Pressable
      onPress={() => router.push('/screen/gigagent/groupdetail')}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
    >
      <Image source={{ uri: item.image }} style={styles.rowImage} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{item.name}</Text>
        <Text style={styles.rowMeta}>
          {item.type} • {Intl.NumberFormat().format(item.members)} members
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
          <TouchableOpacity style={styles.iconBtn} onPress={() => { /* TODO: open filter */ }}>
            <Ionicons name="options-outline" size={22} color="#111" />
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
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: '#6B7280' }}>No groups match "{query}".</Text>
          </View>
        }
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
  rowImage: { width: 44, height: 44, borderRadius: 8 },
  rowTitle: { fontSize: 16, fontWeight: '600', color: '#111' },
  rowMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});
