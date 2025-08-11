import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ marginBottom: 18 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header block */}
        <View style={styles.headerRow}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/160?img=67' }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>Kenneth Okereke</Text>
            <Text style={styles.subtitle}>Stage name: "The Referrer"</Text>
            <Text style={styles.meta}>Wrestler • New York, NY</Text>
          </View>
          <View style={{ alignItems: 'center', gap: 8 }}>
            <View style={styles.iconBtn}>
              <Ionicons name="chatbubbles-outline" size={18} color="#111" />
            </View>
            <View style={styles.iconBtn}>
              <Ionicons name="share-outline" size={18} color="#111" />
            </View>
          </View>
        </View>

        {/* Suggested / progress like LinkedIn (horizontal dots not needed now) */}
        <Section title="Profile status">
          <View style={{ gap: 12 }}>
            <View style={styles.progressBarWrap}>
              <View style={[styles.progressFill, { width: '45%' }]} />
            </View>
            <Text style={styles.muted}>Complete your details to increase discoverability.</Text>
          </View>
        </Section>

        <Section title="About">
          <Text style={styles.body}>
            Wrestler/MMA talent focused on event appearances and crowd engagement.
            Available for promotions, live shows, and brand activations.
          </Text>
        </Section>

        <Section title="Vitals">
          <View style={styles.chipsRow}>
            <View style={styles.chip}><Text style={styles.chipText}>Height 6'1"</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Weight 190 lb</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Orthodox</Text></View>
          </View>
        </Section>

        <Section title="Licenses & Certificates">
          <Text style={styles.body}>Athletic Commission License • CPR/AED Certified</Text>
        </Section>

        <Section title="Social">
          <View style={styles.iconsRow}>
            <Ionicons name="logo-instagram" size={20} color="#111" />
            <Ionicons name="logo-tiktok" size={20} color="#111" />
            <Ionicons name="logo-twitter" size={20} color="#111" />
          </View>
        </Section>

        <Section title="Portfolio">
          <Text style={styles.body}>Add links to matches, reels, or press.</Text>
        </Section>

        <Section title="Awards">
          <Text style={styles.body}>"Fan Favorite" • "Rising Star 2024"</Text>
        </Section>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16,
  },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#E5E7EB' },
  name: { fontSize: 22, fontWeight: '800', color: '#111' },
  subtitle: { fontSize: 14, color: '#111', marginTop: 2 },
  meta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center'
  },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 8 },
  sectionCard: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 14
  },
  body: { fontSize: 14, color: '#111', lineHeight: 20 },
  muted: { fontSize: 13, color: '#6B7280' },

  progressBarWrap: {
    height: 8, borderRadius: 8, backgroundColor: '#E5E7EB', overflow: 'hidden'
  },
  progressFill: { height: 8, backgroundColor: '#1F7A1F' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#EEF2F5', borderRadius: 16 },
  chipText: { fontSize: 12, color: '#111' },
  iconsRow: { flexDirection: 'row', gap: 12 },
});
