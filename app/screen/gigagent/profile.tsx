import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';
const TEXT = '#1F2937';
const MUTED = '#6B7280';
const BORDER = '#E5E7EB';

// Mock user data
const USER_DATA = {
  name: 'Julian',
  stageName: 'The Destroyer',
  profession: 'Wrestler',
  location: 'New York City',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  bio: '',
  vitals: {
    height: '6\'2"',
    weight: '220 lbs',
    fightingStyle: 'Orthodox'
  },
  certificates: [],
  socialMedia: [],
  highlights: [],
  awards: [],
  isFighter: true,
  progress: 35
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();

  const handleEdit = (section: string) => {
    console.log(`Edit ${section}`);
    // In real app, this would open edit modal or navigate to edit screen
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header with Edit Icon */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable 
          onPress={() => handleEdit('profile')}
          style={styles.headerEditButton}
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Ionicons name="create-outline" size={20} color={TEXT} />
        </Pressable>
      </View>
      
      {/* Spacer for edit button */}
      <View style={styles.headerSpacer} />

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Container */}
        <View style={styles.profileHeaderContainer}>
          {/* Profile Content */}
          <View style={styles.profileContent}>
            {/* Left Side - Profile Info */}
            <View style={styles.profileLeftSection}>
              {/* Profile Image */}
              <Image source={{ uri: USER_DATA.avatar }} style={styles.profileImage} />
              
              {/* Profile Details */}
              <View style={styles.profileDetails}>
                <Text style={styles.stageName}>{USER_DATA.stageName}</Text>
                <View style={styles.occupationRow}>
                  <Ionicons name="briefcase-outline" size={16} color={MUTED} />
                  <Text style={styles.occupation}>{USER_DATA.profession}</Text>
                </View>
              </View>
            </View>
            
            {/* Right Side - Reviews & Rating */}
            <View style={styles.profileRightSection}>
              <View style={styles.reviewsColumn}>
                <Text style={styles.reviewsNumber}>22</Text>
                <Text style={styles.reviewsLabel}>Reviews</Text>
              </View>
              <View style={styles.ratingColumn}>
                <View style={styles.ratingNumberRow}>
                  <Text style={styles.ratingNumber}>4.95</Text>
                  <Text style={styles.starIcon}>★</Text>
                </View>
                <Text style={styles.ratingLabel}>Rating</Text>
              </View>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.placeholderText}>Add bio</Text>
        </View>

        {/* Measurements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Measurements</Text>
          <View style={styles.measurementsRow}>
            <View style={styles.measurementPill}>
              <Text style={styles.measurementText}>{USER_DATA.vitals.height}</Text>
            </View>
            <View style={styles.measurementPill}>
              <Text style={styles.measurementText}>{USER_DATA.vitals.weight}</Text>
            </View>
          </View>
        </View>

        {/* Location Section */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color={MUTED} />
            <Text style={styles.infoText}>{USER_DATA.location}</Text>
          </View>
        </View>

        {/* Portfolio Link Section */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Ionicons name="link-outline" size={16} color={MUTED} />
            <Pressable onPress={() => handleEdit('portfolio')}>
              <Text style={styles.linkText}>Add portfolio link</Text>
            </Pressable>
          </View>
        </View>

        {/* Achievements Section (Talent Only) */}
        {USER_DATA.isFighter && (
          <View style={styles.achievementsContainer}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.achievementsTitle}>Recent Achievements</Text>
            </View>
            <View style={styles.achievementsContent}>
              <View style={styles.achievementBadge}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="document-text-outline" size={24} color={MUTED} />
                </View>
                <Text style={styles.achievementLabel}>Add awards #1</Text>
              </View>
              <View style={styles.achievementBadge}>
                <View style={styles.achievementIcon}>
                  <Ionicons name="camera-outline" size={24} color={MUTED} />
                </View>
                <Text style={styles.achievementLabel}>Add awards #2</Text>
              </View>
            </View>
          </View>
        )}

        {/* Social Media Section (Talent Only) */}
        {USER_DATA.isFighter && (
          <View style={styles.socialMediaContainer}>
            <View style={styles.socialMediaHeader}>
              <Text style={styles.socialMediaTitle}>Social Media</Text>
              <Pressable 
                onPress={() => handleEdit('socialMedia')}
                style={styles.sectionEditButton}
                accessibilityRole="button"
                accessibilityLabel="Edit social media"
              >
                <Ionicons name="create-outline" size={16} color={MUTED} />
              </Pressable>
            </View>
            <Text style={styles.socialMediaPlaceholder}>Add social media links</Text>
          </View>
        )}

        {/* Ratings & Reviews Section */}
        <View style={styles.ratingsContainer}>
          <Text style={styles.ratingsTitle}>Ratings & Reviews</Text>
          
          {/* Rating Summary */}
          <View style={styles.ratingSummary}>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingsStarIcon}>★</Text>
              <Text style={styles.ratingsNumber}>4.95</Text>
              <Text style={styles.ratingSeparator}>·</Text>
              <Text style={styles.reviewCount}>22 reviews</Text>
            </View>
          </View>

          {/* Criteria Scores */}
          <View style={styles.criteriaSection}>
            <View style={styles.criteriaRow}>
              <Text style={styles.criteriaLabel}>Performance</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '100%' }]} />
              </View>
              <Text style={styles.criteriaScore}>5.0</Text>
            </View>
            <View style={styles.criteriaRow}>
              <Text style={styles.criteriaLabel}>On-time</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: '98%' }]} />
              </View>
              <Text style={styles.criteriaScore}>4.9</Text>
            </View>
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsList}>
            <View style={styles.reviewItem}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face' }} 
                style={styles.reviewerAvatar} 
              />
              <View style={styles.reviewContent}>
                <Text style={styles.reviewerName}>Emma</Text>
                <Text style={styles.reviewDate}>May 2023</Text>
                <Text style={styles.reviewBody}>Amazing experience, very professional and reliable.</Text>
              </View>
            </View>
            
            <View style={styles.reviewItem}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face' }} 
                style={styles.reviewerAvatar} 
              />
              <View style={styles.reviewContent}>
                <Text style={styles.reviewerName}>Marcus</Text>
                <Text style={styles.reviewDate}>July 2023</Text>
                <Text style={styles.reviewBody}>Great timing, solid performance, would recommend.</Text>
              </View>
            </View>
            
            <View style={styles.reviewItem}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face' }} 
                style={styles.reviewerAvatar} 
              />
              <View style={styles.reviewContent}>
                <Text style={styles.reviewerName}>Tanya</Text>
                <Text style={styles.reviewDate}>October 2022</Text>
                <Text style={styles.reviewBody}>Delivered exactly as expected. Great energy!</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  headerEditButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
  },
  headerSpacer: {
    height: 20,
  },
  profileHeaderContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  profileContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  profileLeftSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileDetails: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 4,
  },
  stageName: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 8,
  },
  occupationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  occupation: {
    fontSize: 16,
    color: MUTED,
  },
  profileRightSection: {
    alignItems: 'flex-end',
    gap: 16,
  },
  reviewsColumn: {
    alignItems: 'center',
  },
  reviewsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
  },
  reviewsLabel: {
    fontSize: 14,
    color: MUTED,
  },
  ratingColumn: {
    alignItems: 'center',
  },
  ratingNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },
  starIcon: {
    fontSize: 20,
    color: TEXT,
    marginLeft: 2,
  },
  ratingLabel: {
    fontSize: 14,
    color: MUTED,
  },
  section: {
    marginBottom: 24,
  },
  achievementsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  viewAllLink: {
    fontSize: 16,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  achievementsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  achievementBadge: {
    alignItems: 'center',
    flex: 1,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementLabel: {
    fontSize: 14,
    color: TEXT,
    textAlign: 'center',
  },
  socialMediaContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  socialMediaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialMediaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
  },
  socialMediaPlaceholder: {
    fontSize: 16,
    color: MUTED,
  },
  sectionEditButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
  },
  ratingsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ratingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 16,
  },
  ratingSummary: {
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingsStarIcon: {
    fontSize: 20,
    color: TEXT,
  },
  ratingsNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },
  ratingSeparator: {
    fontSize: 20,
    color: MUTED,
    marginHorizontal: 4,
  },
  reviewCount: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },
  criteriaSection: {
    marginBottom: 24,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  criteriaLabel: {
    fontSize: 16,
    color: TEXT,
    width: 80,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: TEXT,
    borderRadius: 2,
  },
  criteriaScore: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    width: 30,
    textAlign: 'right',
  },
  reviewsList: {
    gap: 20,
  },
  reviewItem: {
    flexDirection: 'row',
    gap: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewContent: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 8,
  },
  reviewBody: {
    fontSize: 16,
    color: TEXT,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 16,
    color: MUTED,
  },
  measurementsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  measurementPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
  },
  measurementText: {
    fontSize: 14,
    color: TEXT,
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 16,
    color: TEXT,
  },
  linkText: {
    fontSize: 16,
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
});
