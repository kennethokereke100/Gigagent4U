import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Profile() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* Sticky Header Section */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {/* Profile Picture - Centered and overlapping */}
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
            style={styles.profileImage}
          />
        </View>

        {/* Name and Title - Outside header on white background */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>Destroyer</Text>
          <View style={styles.occupationRow}>
            <Ionicons name="diamond" size={16} color="#000" />
            <Text style={styles.title}>Wrestler</Text>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {/* Divider to separate header from content */}
        <View style={styles.divider} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>22</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Text style={styles.statNumber}>4.95</Text>
              <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.placeholderText}>Add bio</Text>
        </View>

        <View style={styles.divider} />

        {/* Measurements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurements</Text>
          <View style={styles.measurementsRow}>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>6'2"</Text>
              <Text style={styles.measurementLabel}>Height</Text>
            </View>
            <View style={styles.measurementItem}>
              <Text style={styles.measurementValue}>220 lbs</Text>
              <Text style={styles.measurementLabel}>Weight</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Recent Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsRow}>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementIconText}>+</Text>
              </View>
              <Text style={styles.achievementLabel}>Add Award #1</Text>
            </View>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementIconText}>+</Text>
              </View>
              <Text style={styles.achievementLabel}>Add Award #2</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          <Text style={styles.placeholderText}>Add social links</Text>
        </View>

        <View style={styles.divider} />

        {/* Ratings and Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings and Reviews</Text>
          {/* Example Review */}
          <View style={styles.reviewItem}>
            <Text style={styles.reviewerName}>User123</Text>
            <Text style={styles.reviewText}>Great performance, loved the energy!</Text>
          </View>
          <View style={styles.reviewItem}>
            <Text style={styles.reviewerName}>Fan99</Text>
            <Text style={styles.reviewText}>One of the best wrestlers I've seen live.</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stickyHeader: {
    backgroundColor: '#fff',
    zIndex: 10,
  },
  header: {
    backgroundColor: '#1c1c1c',
    height: 140,
    alignItems: 'center',
    position: 'relative',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    marginTop: 40,
    position: 'absolute',
    top: 40,
  },
  nameSection: {
    alignItems: 'center',
    marginTop: 20, // Position below the profile image with proper spacing
    marginBottom: 20,
    backgroundColor: '#fff', // White background
  },
  occupationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
  },
  title: {
    fontSize: 16,
    color: '#555',
    marginLeft: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 0,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  placeholderText: {
    fontSize: 14,
    color: '#888',
  },
  measurementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  measurementItem: {
    alignItems: 'center',
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  measurementLabel: {
    fontSize: 14,
    color: '#555',
  },
  achievementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
  },
  achievementIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementIconText: {
    color: '#aaa',
    fontSize: 24,
  },
  achievementLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
  },
  reviewItem: {
    marginBottom: 12,
  },
  reviewerName: {
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
  },
});
