import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../../firebaseConfig';

const BG = '#F5F3F0';

interface Achievement {
  title: string;
  icon: string;
}

interface Social {
  platform: string;
  url: string;
}

interface ProfileData {
  name?: string;
  nickname?: string;
  role?: string;
  categories?: string[];
  about?: string;
  measurements?: {
    height?: string;
    weight?: string;
  };
  achievements?: Achievement[];
  socials?: Social[];
  contact?: string;
  photoUrl?: string;
}

export default function SavedProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams<{ userId: string }>();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(db, 'profiles', userId);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile(profileSnap.data() as ProfileData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const getSocialLogo = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return require('../../assets/socials/instagram.png');
      case 'x':
      case 'twitter':
        return require('../../assets/socials/x.png');
      case 'facebook':
        return require('../../assets/socials/facebook.png');
      case 'linkedin':
        return require('../../assets/socials/linkedin.png');
      default:
        return null;
    }
  };

  const getSocialDisplayName = (platform: string): string => {
    switch (platform.toLowerCase()) {
      case 'x':
        return 'X';
      case 'twitter':
        return 'X';
      case 'instagram':
        return 'Instagram';
      case 'facebook':
        return 'Facebook';
      case 'linkedin':
        return 'LinkedIn';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  const handleSocialLinkPress = (url: string, platform: string) => {
    if (!url || url.trim() === '') {
      Alert.alert('No Link', 'This social media account has no link associated with it.');
      return;
    }

    Alert.alert(
      'Leave GigAgent4U',
      `You are about to leave GigAgent4U and go to ${getSocialDisplayName(platform)}. Do you want to continue?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            Linking.openURL(url).catch((err) => {
              console.error('Failed to open URL:', err);
              Alert.alert('Error', 'Failed to open the link. Please try again.');
            });
          },
        },
      ]
    );
  };

  const handleMessage = () => {
    const promoterName = profile?.name || profile?.nickname || 'Promoter';
    router.push({
      pathname: '/screen/Message',
      params: {
        promoterId: userId,
        promoterName: promoterName,
        fromScreen: 'savedprofile'
      }
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Profile not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sticky Header Section */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {/* Back Button */}
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>

          {/* Profile Picture - Centered and overlapping */}
          <Image
            source={{ uri: profile.photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
            style={styles.profileImage}
          />

          {/* Message Button */}
          <Pressable style={styles.messageButton} onPress={handleMessage}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <Text style={styles.messageButtonText}>Message</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Info Section */}
        <View style={styles.profileInfoSection}>
          <Text style={styles.profileName}>
            {profile.name || profile.nickname || 'Unknown User'}
          </Text>
          <Text style={styles.profileRole}>{profile.role || 'User'}</Text>
          
          {/* Categories */}
          {profile.categories && profile.categories.length > 0 && (
            <View style={styles.categoriesContainer}>
              {profile.categories.map((category, index) => (
                <View key={index} style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{category}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Divider to separate header from content */}
        <View style={styles.divider} />

        {/* About Section */}
        {profile.about && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.aboutText}>{profile.about}</Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Contact Section */}
        {profile.contact && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Text style={styles.contactText}>{profile.contact}</Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          <View style={styles.socialsGrid}>
            {profile.socials && profile.socials.length > 0 ? (
              profile.socials.map((social, index) => {
                const logo = getSocialLogo(social.platform);
                return (
                  <Pressable 
                    key={index} 
                    style={styles.socialItem}
                    onPress={() => handleSocialLinkPress(social.url, social.platform)}
                  >
                    <View style={styles.socialIcon}>
                      {logo ? (
                        <Image source={logo} style={styles.socialLogo} />
                      ) : (
                        <Text style={styles.socialIconText}>?</Text>
                      )}
                    </View>
                    <Text style={styles.socialLabel}>
                      {getSocialDisplayName(social.platform)}
                    </Text>
                  </Pressable>
                );
              })
            ) : (
              <>
                <View style={styles.socialItem}>
                  <View style={styles.socialIcon}>
                    <Text style={styles.socialIconText}>?</Text>
                  </View>
                  <Text style={styles.socialLabel}>No social media</Text>
                </View>
                <View style={styles.socialItem}>
                  <View style={styles.socialIcon}>
                    <Text style={styles.socialIconText}>?</Text>
                  </View>
                  <Text style={styles.socialLabel}>No social media</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsGrid}>
            {profile.achievements && profile.achievements.length > 0 ? (
              profile.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <View style={styles.achievementIcon}>
                    <Image
                      source={require('../../assets/images/medicaltrophy.png')}
                      style={styles.trophyIcon}
                    />
                  </View>
                  <Text style={styles.achievementLabel}>{achievement.title}</Text>
                </View>
              ))
            ) : (
              <>
                <View style={styles.achievementItem}>
                  <View style={styles.achievementIcon}>
                    <Text style={styles.achievementIconText}>?</Text>
                  </View>
                  <Text style={styles.achievementLabel}>No achievements yet</Text>
                </View>
                <View style={styles.achievementItem}>
                  <View style={styles.achievementIcon}>
                    <Text style={styles.achievementIconText}>?</Text>
                  </View>
                  <Text style={styles.achievementLabel}>No achievements yet</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Measurements Section (for physical talents) */}
        {profile.measurements && (profile.measurements.height || profile.measurements.weight) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Measurements</Text>
            <View style={styles.measurementsContainer}>
              {profile.measurements.height && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Height</Text>
                  <Text style={styles.measurementValue}>{profile.measurements.height}</Text>
                </View>
              )}
              {profile.measurements.weight && (
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementLabel}>Weight</Text>
                  <Text style={styles.measurementValue}>{profile.measurements.weight}</Text>
                </View>
              )}
            </View>
          </View>
        )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#fff',
    marginTop: -20,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  profileInfoSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  categoryChip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
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
  aboutText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 22,
  },
  contactText: {
    fontSize: 14,
    color: '#888',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  achievementItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 16,
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
    textAlign: 'center',
  },
  trophyIcon: {
    width: 40,
    height: 40,
  },
  socialsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  socialItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: 16,
  },
  socialIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIconText: {
    color: '#aaa',
    fontSize: 24,
  },
  socialLabel: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
    textAlign: 'center',
  },
  socialLogo: {
    width: 40,
    height: 40,
  },
  measurementsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  measurementItem: {
    alignItems: 'center',
  },
  measurementLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  measurementValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  placeholder: {
    width: 24,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 0,
  },
});
