import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

export default function GroupDetail() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Banner */}
      <View style={{ backgroundColor: '#fff' }}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80' }}
          style={{ width: '100%', height: 180 }}
          resizeMode="cover"
        />

        {/* Top bar over banner */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.circleBtn}>
            <Ionicons name="arrow-back" size={20} color="#111" />
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable style={styles.circleBtn}><Ionicons name="share-outline" size={20} color="#111" /></Pressable>
            <Pressable style={styles.circleBtn}><Ionicons name="notifications-outline" size={20} color="#111" /></Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}>
        {/* Title & meta */}
        <Text style={styles.title}>Wrestling Group</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 }}>
          <Ionicons name="people-outline" size={16} color="#6B7280" />
          <Text style={styles.meta}>Unlisted group • 2,769,405 members</Text>
        </View>

        {/* Action: Start a post */}
        <View style={styles.postRow}>
          <Ionicons name="create-outline" size={20} color="#111" />
          <Text style={{ flex: 1, color: '#111', fontWeight: '600' }}>Start a post in this group</Text>
          <Ionicons name="camera-outline" size={20} color="#6B7280" />
          <Ionicons name="document-attach-outline" size={20} color="#6B7280" />
        </View>

        {/* Card: Ask a question */}
        <View style={styles.helpCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontWeight: '700', color: '#111' }}>Ask the group a question</Text>
            <Ionicons name="close" size={18} color="#6B7280" />
          </View>
          <Text style={{ color: '#374151', marginTop: 4 }}>
            This can be a great way to ask for help or connect with other group members.
          </Text>
          <Pressable style={styles.primaryGhost}>
            <Text style={styles.primaryGhostText}>Ask a question</Text>
          </Pressable>
        </View>

        {/* Segments */}
        <View style={styles.segments}>
          <Pressable style={[styles.segment, styles.segmentActive]}>
            <Text style={[styles.segmentText, styles.segmentTextActive]}>All</Text>
          </Pressable>
          <Pressable style={styles.segment}>
            <Text style={styles.segmentText}>Recommended</Text>
          </Pressable>
        </View>

        {/* One dummy post */}
        <View style={styles.postCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=120&q=80' }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
            <View>
              <Text style={{ fontWeight: '600', color: '#111' }}>Fakhar Ijaz</Text>
              <Text style={{ color: '#6B7280', fontSize: 12 }}>Musician • 12h</Text>
            </View>
            <Pressable style={{ marginLeft: 'auto' }}>
              <Text style={{ color: '#2563EB', fontWeight: '600' }}>+ Follow</Text>
            </Pressable>
          </View>
          <Text style={{ marginTop: 10, color: '#111' }}>
            Looking to perform soon?
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#ffffffee',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginTop: 12 },
  meta: { color: '#6B7280' },

  postRow: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  helpCard: {
    marginTop: 12,
    backgroundColor: '#E6F4EA',
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#CDE7D3',
  },
  primaryGhost: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#111',
    backgroundColor: '#fff',
  },
  primaryGhostText: { color: '#111', fontWeight: '700' },

  segments: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  segmentActive: { borderColor: '#111' },
  segmentText: { color: '#6B7280', fontWeight: '600' },
  segmentTextActive: { color: '#111' },

  postCard: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
});
