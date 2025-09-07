import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import { auth, db } from '../../../firebaseConfig';
import StarComment from '../../components/StarComment';
const pencilSimpleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ffffff" viewBox="0 0 256 256"><path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path></svg>`;

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
}

// Constants from Questions.tsx - exact pillar names
const TALENT_CATEGORIES = ['UFC Athlete', 'Boxer', 'Wrestler', 'Comedian', 'Musician', 'Referee', 'Ring Announcer', 'Cutman', 'Coach', 'Other'];
const PROMOTER_CATEGORIES = ['Event Organizer', 'Matchmaker', 'Venue Owner', 'Talent Scout', 'Brand Partner', 'Media/Press', 'Sponsor Rep', 'Street Team', 'Other'];

// Helper functions - using exact pillar names from Questions.tsx
const isPhysicalTalent = (role: string): boolean => {
  return ['Wrestler', 'Boxer', 'UFC Athlete'].includes(role);
};

const isPromoter = (role: string): boolean => {
  return PROMOTER_CATEGORIES.includes(role);
};

const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX
  if (cleaned.length >= 10) {
    const areaCode = cleaned.slice(0, 3);
    const firstPart = cleaned.slice(3, 6);
    const secondPart = cleaned.slice(6, 10);
    return `(${areaCode}) ${firstPart}-${secondPart}`;
  }
  
  return phone; // Return original if not enough digits
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData>({});

  // Empty comments data for now - will be populated from Firebase later
  const commentsData: any[] = [];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log("No user logged in, skipping profile data load");
        setProfileData({});
        setIsLoading(false);
        return;
      }

      console.log("User authenticated, loading profile data");
      loadProfileData();
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const loadProfileData = async () => {
    const user = auth.currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      // Load from profiles collection first
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      // Also load from users collection as fallback for name
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let profileData: any = {
        name: 'Destroyer',
        nickname: '',
        role: '',
        categories: [],
        about: '',
        measurements: { height: '', weight: '' },
        achievements: [],
        socials: [],
        contact: '',
      };

      // Get profile data
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        profileData = {
          ...profileData,
          ...data,
          name: data.name || profileData.name,
        };
      }

      // Get user data as fallback for name
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.displayName && (!profileData.name || profileData.name === 'Destroyer')) {
          profileData.name = userData.displayName;
          
          // Update profiles collection with the name if it's missing
          if (profileSnap.exists()) {
            try {
              await setDoc(profileRef, { name: userData.displayName }, { merge: true });
              console.log('✅ Updated profiles collection with name from users collection');
            } catch (error) {
              console.error('Error updating profiles collection:', error);
            }
          }
        }
        if (userData.role && !profileData.role) {
          profileData.role = userData.role;
        }
        if (userData.categories && !profileData.categories?.length) {
          profileData.categories = userData.categories;
        }
      }

      console.log('📊 Loaded profile data:', profileData);
      setProfileData(profileData);
      
    } catch (error) {
      console.error('Error loading profile data:', error);
      // Set default values on error
      setProfileData({
        name: 'Destroyer',
        nickname: '',
        role: '',
        categories: [],
        about: '',
        measurements: { height: '', weight: '' },
        achievements: [],
        socials: [],
        contact: '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSocialLogo = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram':
        return require('../../../assets/socials/instagram.png');
      case 'x':
      case 'twitter':
        return require('../../../assets/socials/x.png');
      case 'facebook':
        return require('../../../assets/socials/facebook.png');
      case 'linkedin':
        return require('../../../assets/socials/linkedin.png');
      default:
        return null;
    }
  };

  const getSocialDisplayName = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'x':
        return 'X';
      case 'twitter':
        return 'Twitter';
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

  return (
    <View style={styles.container}>
      {/* Sticky Header Section */}
      <View style={[styles.stickyHeader, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          {/* Edit Button */}
          <View style={styles.editContainer}>
            <Pressable onPress={() => router.push("/screen/gigagent/editprofile")}>
              <SvgXml xml={pencilSimpleSvg} width={26} height={26} />
              <Text style={styles.editText}>Edit Profile</Text>
            </Pressable>
          </View>

          {/* Profile Picture - Centered and overlapping */}
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }}
            style={styles.profileImage}
          />
        </View>

        {/* Name and Title - Outside header on white background */}
        <View style={styles.nameSection}>
          <Text style={styles.name}>{profileData.name || 'Destroyer'}</Text>
          {profileData.nickname && (
            <Text style={styles.nickname}>"{profileData.nickname}"</Text>
          )}
          <View style={styles.occupationRow}>
            <Ionicons name="diamond" size={16} color="#000" />
            <Text style={styles.title}>
              {profileData.role ? (
                profileData.role === 'Promoter' ? 'Promoter' : 
                profileData.categories && profileData.categories.length > 0 ? 
                  profileData.categories.join(', ') : 
                  profileData.role
              ) : 'Select Role'}
            </Text>
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
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.ratingRow}>
              <Text style={styles.statNumber}>0.0</Text>
              <Ionicons name="star" size={16} color="#FFD700" style={styles.starIcon} />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.placeholderText}>
            {profileData.about || 'Add bio'}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Measurements Section - Only for Wrestler, Boxer, UFC Athlete */}
        {profileData.categories && isPhysicalTalent(profileData.categories.join(',')) && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Measurements</Text>
              <View style={styles.measurementsRow}>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementValue}>
                    {profileData.measurements?.height || '-'}
                  </Text>
                  <Text style={styles.measurementLabel}>Height</Text>
                </View>
                <View style={styles.measurementItem}>
                  <Text style={styles.measurementValue}>
                    {profileData.measurements?.weight || '-'}
                  </Text>
                  <Text style={styles.measurementLabel}>Weight</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Contact Section - Only for Promoters */}
        {profileData.role === 'Promoter' && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Text style={styles.placeholderText}>
                {profileData.contact ? formatPhoneNumber(profileData.contact) : 'No number added'}
              </Text>
            </View>
            <View style={styles.divider} />
          </>
        )}

        {/* Recent Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.achievementsGrid}>
            {profileData.achievements && profileData.achievements.length > 0 ? (
              profileData.achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <View style={styles.achievementIcon}>
                    <Image
                      source={require('../../../assets/images/medicaltrophy.png')}
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
              </>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Social Media Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          <View style={styles.socialsGrid}>
            {profileData.socials && profileData.socials.length > 0 ? (
              profileData.socials.map((social, index) => {
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
                        <Text style={styles.socialIconText}>+</Text>
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
                    <Text style={styles.socialIconText}>+</Text>
                  </View>
                  <Text style={styles.socialLabel}>Social #1</Text>
                </View>
                <View style={styles.socialItem}>
                  <View style={styles.socialIcon}>
                    <Text style={styles.socialIconText}>+</Text>
                  </View>
                  <Text style={styles.socialLabel}>Social #2</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Ratings and Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ratings and Reviews</Text>
          <StarComment comments={commentsData} />
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
  nickname: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 2,
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
  editContainer: {
    position: "absolute",
    top: 12,
    right: 12,
    alignItems: "center",
  },
  editText: {
    fontSize: 12,
    color: "#fff",
    marginTop: 4,
  },
});
