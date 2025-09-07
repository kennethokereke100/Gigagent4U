import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Easing,
    Image,
    Keyboard,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheetQuestion from '../../../components/BottomSheetQuestion';
import { auth, db } from '../../../firebaseConfig';
import { uploadImageToStorage } from '../../../utils/uploadImageToStorage';

// Reuse the same helpers
const isPhysicalTalent = (role: string) => {
  return ["Wrestler", "Boxer", "UFC Athlete"].includes(role);
};

const isPromoter = (role: string) => {
  const PROMOTER_CATEGORIES = [
    "Event Organizer",
    "Matchmaker",
    "Venue Owner",
    "Talent Scout",
    "Brand Partner",
    "Media/Press",
    "Sponsor Rep",
    "Street Team",
    "Other",
  ];
  return PROMOTER_CATEGORIES.includes(role);
};

// Save profile (full save, like when user presses "Save" in header)
export const handleSaveProfile = async (form: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  try {
    let profileData: any = {
      name: form.name || "",
      nickname: form.nickname || "",
      role: form.role || "",
      categories: form.categories || [],
      about: form.about || "",
      achievements: form.achievements || [],
      socials: form.socials || [],
      updatedAt: new Date(),
    };

    if (form.categories && isPhysicalTalent(form.categories.join(',')) && form.measurements) {
      profileData.measurements = {
        height: form.measurements.height || "",
        weight: form.measurements.weight || "",
      };
    }

    if (form.role === 'Promoter' && form.contact) {
      profileData.contact = form.contact;
    }

    await setDoc(doc(db, "profiles", user.uid), profileData, { merge: true });
    console.log("✅ Profile saved", profileData);
  } catch (err) {
    console.error("❌ Error saving profile:", err);
    throw err;
  }
};

// Remove a single achievement
export const removeAchievement = async (index: number, achievements: any[]) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const updated = achievements.filter((_, i) => i !== index);

  await updateDoc(doc(db, "profiles", user.uid), {
    achievements: updated,
    updatedAt: new Date(),
  });

  console.log("✅ Achievement removed");
  return updated;
};

// Remove a single social
export const removeSocial = async (index: number, socials: any[]) => {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");

  const updated = socials.filter((_, i) => i !== index);

  await updateDoc(doc(db, "profiles", user.uid), {
    socials: updated,
    updatedAt: new Date(),
  });

  console.log("✅ Social removed");
  return updated;
};

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
  profilePicture?: string;
  bio?: string;
  height?: string;
  weight?: string;
  role?: string;
  categories?: string[];
  achievements?: Achievement[];
  socials?: Social[];
  contact?: string;
}


export default function EditProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Profile data state
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    nickname: '',
    profilePicture: '',
    bio: '',
    height: '',
    weight: '',
    role: '',
    categories: [],
    achievements: [],
    socials: [],
    contact: '',
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Bottom sheet states
  const [nicknameSheetVisible, setNicknameSheetVisible] = useState(false);
  const [aboutSheetVisible, setAboutSheetVisible] = useState(false);
  const [measurementsSheetVisible, setMeasurementsSheetVisible] = useState(false);
  const [achievementsSheetVisible, setAchievementsSheetVisible] = useState(false);
  const [socialLinksSheetVisible, setSocialLinksSheetVisible] = useState(false);
  const [contactSheetVisible, setContactSheetVisible] = useState(false);
  
  // Temporary values for bottom sheets
  const [tempNickname, setTempNickname] = useState('');
  const [tempBio, setTempBio] = useState('');
  const [tempHeight, setTempHeight] = useState({ feet: 6, inches: 0 });
  const [tempWeight, setTempWeight] = useState(180);
  const [tempAchievements, setTempAchievements] = useState<Achievement[]>([]);
  const [tempSocials, setTempSocials] = useState<Social[]>([]);
  const [tempContact, setTempContact] = useState('');

  // Load existing profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Load from profiles collection first
      const profileRef = doc(db, 'profiles', user.uid);
      const profileSnap = await getDoc(profileRef);
      
      // Also load from users collection as fallback for name
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      let profileData: any = {
        name: '',
        nickname: '',
        profilePicture: '',
        bio: '',
        height: '',
        weight: '',
        role: '',
        categories: [],
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
        if (userData.displayName && (!profileData.name || profileData.name === '')) {
          profileData.name = userData.displayName;
        }
        if (userData.role && !profileData.role) {
          profileData.role = userData.role;
        }
        if (userData.categories && !profileData.categories?.length) {
          profileData.categories = userData.categories;
        }
      }

      console.log('📊 EditProfile loaded data:', profileData);
      setProfileData(profileData);
      
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera roll permissions to upload photos.');
        return;
      }

      Alert.alert(
        'Select Photo',
        'Choose how you want to add a photo',
        [
          { text: 'Camera', onPress: () => openCamera() },
          { text: 'Photo Library', onPress: () => openImageLibrary() },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Error', 'Failed to request permissions');
    }
  };

  const openCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening camera:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error opening image library:', error);
      Alert.alert('Error', 'Failed to open image library');
    }
  };

  const uploadProfileImage = async (uri: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setIsLoading(true);
      const timestamp = Date.now().toString();
      const path = `profileImages/${user.uid}/${timestamp}.jpg`;
      
      const downloadURL = await uploadImageToStorage(uri, path);
      
      setProfileData(prev => ({
        ...prev,
        profilePicture: downloadURL,
      }));
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Prepare form data for the clean save function
      const formData: any = {
        name: profileData.name || '',
        nickname: profileData.nickname || '',
        role: profileData.role || '',
        categories: profileData.categories || [],
        about: profileData.bio || '',
        measurements: {
          height: profileData.height || '',
          weight: profileData.weight || '',
        },
        achievements: profileData.achievements || [],
        socials: profileData.socials || [],
        contact: profileData.contact || '',
      };

      // Use the clean handleSaveProfile function
      await handleSaveProfile(formData);

      Alert.alert('Success', 'Profile saved successfully!', [
        { text: 'OK', onPress: () => router.push('/screen/eventlist?activeTab=profile') }
      ]);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const openNicknameSheet = () => {
    setTempNickname(profileData.nickname || '');
    setNicknameSheetVisible(true);
  };

  const saveNickname = (nickname: string) => {
    setProfileData(prev => ({ ...prev, nickname }));
    setNicknameSheetVisible(false);
  };

  const openAboutSheet = () => {
    setTempBio(profileData.bio || '');
    setAboutSheetVisible(true);
  };

  const saveAbout = (bio: string) => {
    setProfileData(prev => ({ ...prev, bio }));
    setAboutSheetVisible(false);
  };

  const openMeasurementsSheet = () => {
    // Parse existing height if available
    if (profileData.height) {
      const parts = profileData.height.split("'");
      if (parts.length === 2) {
        const feet = parseInt(parts[0]) || 6;
        const inches = parseInt(parts[1].replace('"', '')) || 0;
        setTempHeight({ feet, inches });
      }
    }
    setTempWeight(parseInt(profileData.weight || '180') || 180);
    setMeasurementsSheetVisible(true);
  };

  const saveMeasurements = () => {
    const height = `${tempHeight.feet}'${tempHeight.inches}"`;
    const weight = `${tempWeight} lbs`;
    setProfileData(prev => ({ ...prev, height, weight }));
    setMeasurementsSheetVisible(false);
  };

  const detectPlatform = (url: string): string => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return 'x';
    if (lowerUrl.includes('facebook.com')) return 'facebook';
    if (lowerUrl.includes('linkedin.com')) return 'linkedin';
    return 'other';
  };

  const openAchievementsSheet = () => {
    setTempAchievements(profileData.achievements?.length ? [...profileData.achievements] : []);
    setAchievementsSheetVisible(true);
  };

  const saveAchievements = () => {
    const achievements = tempAchievements.filter(a => a.title.trim() !== '');
    setProfileData(prev => ({ ...prev, achievements }));
    setAchievementsSheetVisible(false);
  };

  const addAchievement = () => {
    setTempAchievements(prev => [...prev, { title: '', icon: 'medicaltrophy.png' }]);
  };

  const removeAchievement = (index: number) => {
    setTempAchievements(prev => prev.filter((_, i) => i !== index));
  };

  const updateAchievement = (index: number, value: string) => {
    setTempAchievements(prev => prev.map((item, i) => 
      i === index ? { ...item, title: value } : item
    ));
  };

  const openSocialLinksSheet = () => {
    setTempSocials(profileData.socials?.length ? [...profileData.socials] : []);
    setSocialLinksSheetVisible(true);
  };

  const saveSocialLinks = () => {
    const socials = tempSocials.filter(social => social.url.trim() !== '');
    setProfileData(prev => ({ ...prev, socials }));
    setSocialLinksSheetVisible(false);
  };

  const addSocialLink = () => {
    setTempSocials(prev => [...prev, { platform: '', url: '' }]);
  };

  const removeSocialLink = (index: number) => {
    setTempSocials(prev => prev.filter((_, i) => i !== index));
  };

  const updateSocialLink = (index: number, value: string) => {
    const platform = detectPlatform(value);
    setTempSocials(prev => prev.map((item, i) => 
      i === index ? { platform, url: value } : item
    ));
  };

  const openContactSheet = () => {
    setTempContact(profileData.contact || '');
    setContactSheetVisible(true);
  };

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      const areaCode = cleaned.slice(0, 3);
      const firstPart = cleaned.slice(3, 6);
      const secondPart = cleaned.slice(6, 10);
      return `(${areaCode}) ${firstPart}-${secondPart}`;
    } else if (cleaned.length >= 6) {
      const areaCode = cleaned.slice(0, 3);
      const firstPart = cleaned.slice(3, 6);
      const remaining = cleaned.slice(6);
      return `(${areaCode}) ${firstPart}-${remaining}`;
    } else if (cleaned.length >= 3) {
      const areaCode = cleaned.slice(0, 3);
      const remaining = cleaned.slice(3);
      return `(${areaCode}) ${remaining}`;
    } else if (cleaned.length > 0) {
      return `(${cleaned}`;
    }
    
    return '';
  };

  const saveContact = (contact: string) => {
    // Store only raw digits in Firestore
    const rawDigits = contact.replace(/\D/g, '');
    setProfileData(prev => ({ ...prev, contact: rawDigits }));
    setContactSheetVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Pressable 
          onPress={() => router.push('/screen/eventlist?activeTab=profile')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Pressable 
          onPress={handleSave}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Picture</Text>
          <View style={styles.profilePictureContainer}>
            <Image
              source={{ 
                uri: profileData.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' 
              }}
              style={styles.profilePicture}
            />
            <Pressable style={styles.cameraOverlay} onPress={handleImagePicker}>
              <Ionicons name="camera" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        {/* Nickname Section */}
        <View style={styles.section}>
          <Pressable style={styles.sectionHeader} onPress={openNicknameSheet}>
            <Text style={styles.sectionTitle}>Nickname</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>
          <Text style={styles.sectionValue}>
            {profileData.nickname || 'Add nickname'}
          </Text>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Pressable style={styles.sectionHeader} onPress={openAboutSheet}>
            <Text style={styles.sectionTitle}>About</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>
          <Text style={styles.sectionValue}>
            {profileData.bio || 'Add bio'}
          </Text>
        </View>

        {/* Measurements Section - Only for Wrestler, Boxer, UFC Athlete */}
        {profileData.categories && isPhysicalTalent(profileData.categories.join(',')) && (
          <View style={styles.section}>
            <Pressable style={styles.sectionHeader} onPress={openMeasurementsSheet}>
              <Text style={styles.sectionTitle}>Measurements</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>
            <View style={styles.measurementsRow}>
              <Text style={styles.measurementText}>
                Height: {profileData.height || '-'}
              </Text>
              <Text style={styles.measurementText}>
                Weight: {profileData.weight || '-'}
              </Text>
            </View>
          </View>
        )}

        {/* Contact Section - Only for Promoters */}
        {profileData.role === 'Promoter' && (
          <View style={styles.section}>
            <Pressable style={styles.sectionHeader} onPress={openContactSheet}>
              <Text style={styles.sectionTitle}>Contact</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </Pressable>
            <Text style={styles.sectionValue}>
              {profileData.contact ? formatPhoneNumber(profileData.contact) : 'No number added'}
            </Text>
          </View>
        )}

        {/* Achievements Section */}
        <View style={styles.section}>
          <Pressable style={styles.sectionHeader} onPress={openAchievementsSheet}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>
          {profileData.achievements?.length ? (
            profileData.achievements.map((achievement, index) => (
              <Text key={index} style={styles.listItem}>• {achievement.title}</Text>
            ))
          ) : (
            <Text style={styles.placeholderText}>Add achievements</Text>
          )}
        </View>

        {/* Social Links Section */}
        <View style={styles.section}>
          <Pressable style={styles.sectionHeader} onPress={openSocialLinksSheet}>
            <Text style={styles.sectionTitle}>Social Links</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>
          {profileData.socials?.length ? (
            profileData.socials.map((social, index) => (
              <Text key={index} style={styles.listItem}>• {social.platform}: {social.url}</Text>
            ))
          ) : (
            <Text style={styles.placeholderText}>Add social links</Text>
          )}
        </View>
      </ScrollView>

      {/* Nickname Bottom Sheet */}
      <BottomSheetQuestion
        visible={nicknameSheetVisible}
        title="Nickname"
        initialValue={tempNickname}
        placeholder="Enter your nickname..."
        onDone={saveNickname}
        onClose={() => setNicknameSheetVisible(false)}
      />

      {/* About Bottom Sheet */}
      <BottomSheetQuestion
        visible={aboutSheetVisible}
        title="About"
        initialValue={tempBio}
        placeholder="Tell us about yourself..."
        onDone={saveAbout}
        onClose={() => setAboutSheetVisible(false)}
      />

      {/* Measurements Bottom Sheet */}
      <MeasurementsBottomSheet
        visible={measurementsSheetVisible}
        height={tempHeight}
        weight={tempWeight}
        onHeightChange={setTempHeight}
        onWeightChange={setTempWeight}
        onSave={saveMeasurements}
        onClose={() => setMeasurementsSheetVisible(false)}
      />

      {/* Achievements Bottom Sheet */}
      <AchievementsBottomSheet
        visible={achievementsSheetVisible}
        achievements={tempAchievements}
        onAchievementsChange={setTempAchievements}
        onAdd={addAchievement}
        onRemove={removeAchievement}
        onUpdate={updateAchievement}
        onSave={saveAchievements}
        onClose={() => setAchievementsSheetVisible(false)}
      />

      {/* Social Links Bottom Sheet */}
      <SocialLinksBottomSheet
        visible={socialLinksSheetVisible}
        socialLinks={tempSocials}
        onSocialLinksChange={setTempSocials}
        onAdd={addSocialLink}
        onRemove={removeSocialLink}
        onUpdate={updateSocialLink}
        onSave={saveSocialLinks}
        onClose={() => setSocialLinksSheetVisible(false)}
      />

      {/* Contact Bottom Sheet */}
      <ContactBottomSheet
        visible={contactSheetVisible}
        initialValue={tempContact}
        onSave={saveContact}
        onClose={() => setContactSheetVisible(false)}
      />
    </SafeAreaView>
  );
}

// Measurements Bottom Sheet Component
function MeasurementsBottomSheet({
  visible,
  height,
  weight,
  onHeightChange,
  onWeightChange,
  onSave,
  onClose,
}: {
  visible: boolean;
  height: { feet: number; inches: number };
  weight: number;
  onHeightChange: (height: { feet: number; inches: number }) => void;
  onWeightChange: (weight: number) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slide, fade]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });

  const handleSave = () => {
    onSave();
    Keyboard.dismiss();
    onClose();
  };

  const handlePanGesture = (event: any) => {
    const { translationY } = event.nativeEvent;
    if (translationY > 50) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fade }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <PanGestureHandler onGestureEvent={handlePanGesture}>
              <Animated.View style={[styles.sheet, styles.fullHeightSheet, { transform: [{ translateY }] }]}>
                <View style={[styles.sheetHeader, { paddingTop: insets.top + 14 }]}>
                  <Pressable hitSlop={12} onPress={onClose}>
                    <Ionicons name="close" size={22} color="#111" />
                  </Pressable>
                  <Text style={styles.sheetTitle}>Measurements</Text>
                  <Pressable hitSlop={12} onPress={handleSave}>
                    <Text style={styles.done}>Done</Text>
                  </Pressable>
                </View>

                <ScrollView style={styles.measurementsContent} showsVerticalScrollIndicator={false}>
                  {/* Height */}
                  <View style={styles.measurementGroup}>
                    <Text style={styles.measurementLabel}>Height</Text>
                    <View style={styles.pickerRow}>
                      <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Feet</Text>
                        <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(feet => (
                            <Pressable
                              key={feet}
                              style={[styles.pickerItem, height.feet === feet && styles.pickerItemSelected]}
                              onPress={() => onHeightChange({ ...height, feet })}
                            >
                              <Text style={[styles.pickerItemText, height.feet === feet && styles.pickerItemTextSelected]}>
                                {feet}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                      <View style={styles.pickerContainer}>
                        <Text style={styles.pickerLabel}>Inches</Text>
                        <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                          {Array.from({ length: 12 }, (_, i) => i).map(inches => (
                            <Pressable
                              key={inches}
                              style={[styles.pickerItem, height.inches === inches && styles.pickerItemSelected]}
                              onPress={() => onHeightChange({ ...height, inches })}
                            >
                              <Text style={[styles.pickerItemText, height.inches === inches && styles.pickerItemTextSelected]}>
                                {inches}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </View>

                  {/* Weight */}
                  <View style={styles.measurementGroup}>
                    <Text style={styles.measurementLabel}>Weight (lbs)</Text>
                    <View style={styles.pickerContainer}>
                      <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                        {Array.from({ length: 400 }, (_, i) => i + 100).map(weightValue => (
                          <Pressable
                            key={weightValue}
                            style={[styles.pickerItem, weight === weightValue && styles.pickerItemSelected]}
                            onPress={() => onWeightChange(weightValue)}
                          >
                            <Text style={[styles.pickerItemText, weight === weightValue && styles.pickerItemTextSelected]}>
                              {weightValue}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  </View>
                </ScrollView>
              </Animated.View>
            </PanGestureHandler>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Achievements Bottom Sheet Component
function AchievementsBottomSheet({
  visible,
  achievements,
  onAchievementsChange,
  onAdd,
  onRemove,
  onUpdate,
  onSave,
  onClose,
}: {
  visible: boolean;
  achievements: Achievement[];
  onAchievementsChange: (achievements: Achievement[]) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slide, fade]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });

  const handleSave = () => {
    onSave();
    Keyboard.dismiss();
    onClose();
  };

  const handlePanGesture = (event: any) => {
    const { translationY } = event.nativeEvent;
    if (translationY > 50) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fade }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <PanGestureHandler onGestureEvent={handlePanGesture}>
              <Animated.View style={[styles.sheet, styles.fullHeightSheet, { transform: [{ translateY }] }]}>
                <View style={[styles.sheetHeader, { paddingTop: insets.top + 14 }]}>
                  <Pressable hitSlop={12} onPress={onClose}>
                    <Ionicons name="close" size={22} color="#111" />
                  </Pressable>
                  <Text style={styles.sheetTitle}>Achievements</Text>
                  <Pressable hitSlop={12} onPress={handleSave}>
                    <Text style={styles.done}>Done</Text>
                  </Pressable>
                </View>

                <ScrollView style={styles.achievementsContent} showsVerticalScrollIndicator={false}>
                  {achievements.map((achievement, index) => (
                    <View key={index} style={styles.achievementItem}>
                      <TextInput
                        value={achievement.title}
                        onChangeText={(text) => onUpdate(index, text)}
                        placeholder="Enter achievement..."
                        style={styles.achievementInput}
                      />
                      {achievements.length > 1 && (
                        <Pressable onPress={() => onRemove(index)} style={styles.removeButton}>
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </Pressable>
                      )}
                    </View>
                  ))}
                  <Pressable onPress={onAdd} style={styles.addButton}>
                    <Ionicons name="add" size={20} color="#007AFF" />
                    <Text style={styles.addButtonText}>Add More Achievements</Text>
                  </Pressable>
                </ScrollView>
              </Animated.View>
            </PanGestureHandler>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Social Links Bottom Sheet Component
function SocialLinksBottomSheet({
  visible,
  socialLinks,
  onSocialLinksChange,
  onAdd,
  onRemove,
  onUpdate,
  onSave,
  onClose,
}: {
  visible: boolean;
  socialLinks: Social[];
  onSocialLinksChange: (socialLinks: Social[]) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, value: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slide, fade]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });

  const handleSave = () => {
    onSave();
    Keyboard.dismiss();
    onClose();
  };

  const handlePanGesture = (event: any) => {
    const { translationY } = event.nativeEvent;
    if (translationY > 50) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fade }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <PanGestureHandler onGestureEvent={handlePanGesture}>
              <Animated.View style={[styles.sheet, styles.fullHeightSheet, { transform: [{ translateY }] }]}>
                <View style={[styles.sheetHeader, { paddingTop: insets.top + 14 }]}>
                  <Pressable hitSlop={12} onPress={onClose}>
                    <Ionicons name="close" size={22} color="#111" />
                  </Pressable>
                  <Text style={styles.sheetTitle}>Social Links</Text>
                  <Pressable hitSlop={12} onPress={handleSave}>
                    <Text style={styles.done}>Done</Text>
                  </Pressable>
                </View>

                <ScrollView style={styles.socialLinksContent} showsVerticalScrollIndicator={false}>
                  {socialLinks.map((social, index) => (
                    <View key={index} style={styles.socialLinkItem}>
                      <TextInput
                        value={social.url}
                        onChangeText={(text) => onUpdate(index, text)}
                        placeholder="Enter social link..."
                        style={styles.socialLinkInput}
                        keyboardType="url"
                      />
                      {socialLinks.length > 1 && (
                        <Pressable onPress={() => onRemove(index)} style={styles.removeButton}>
                          <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </Pressable>
                      )}
                    </View>
                  ))}
                  <Pressable onPress={onAdd} style={styles.addButton}>
                    <Ionicons name="add" size={20} color="#007AFF" />
                    <Text style={styles.addButtonText}>Add More Links</Text>
                  </Pressable>
                </ScrollView>
              </Animated.View>
            </PanGestureHandler>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// Contact Bottom Sheet Component
function ContactBottomSheet({
  visible,
  initialValue,
  onSave,
  onClose,
}: {
  visible: boolean;
  initialValue: string;
  onSave: (contact: string) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;
  const [phoneNumber, setPhoneNumber] = useState(initialValue);

  useEffect(() => {
    setPhoneNumber(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slide, fade]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [600, 0] });

  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 10) {
      const areaCode = cleaned.slice(0, 3);
      const firstPart = cleaned.slice(3, 6);
      const secondPart = cleaned.slice(6, 10);
      return `(${areaCode}) ${firstPart}-${secondPart}`;
    } else if (cleaned.length >= 6) {
      const areaCode = cleaned.slice(0, 3);
      const firstPart = cleaned.slice(3, 6);
      const remaining = cleaned.slice(6);
      return `(${areaCode}) ${firstPart}-${remaining}`;
    } else if (cleaned.length >= 3) {
      const areaCode = cleaned.slice(0, 3);
      const remaining = cleaned.slice(3);
      return `(${areaCode}) ${remaining}`;
    } else if (cleaned.length > 0) {
      return `(${cleaned}`;
    }
    
    return '';
  };

  const handlePhoneChange = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');
    // Limit to 10 digits
    const limited = cleaned.slice(0, 10);
    setPhoneNumber(limited);
  };

  const handleSave = () => {
    onSave(phoneNumber);
    Keyboard.dismiss();
    onClose();
  };

  const handlePanGesture = (event: any) => {
    const { translationY } = event.nativeEvent;
    if (translationY > 50) {
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fade }]}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <PanGestureHandler onGestureEvent={handlePanGesture}>
              <Animated.View style={[styles.sheet, styles.fullHeightSheet, { transform: [{ translateY }] }]}>
                <View style={[styles.sheetHeader, { paddingTop: insets.top + 14 }]}>
                  <Pressable hitSlop={12} onPress={onClose}>
                    <Ionicons name="close" size={22} color="#111" />
                  </Pressable>
                  <Text style={styles.sheetTitle}>Contact</Text>
                  <Pressable hitSlop={12} onPress={handleSave}>
                    <Text style={styles.done}>Done</Text>
                  </Pressable>
                </View>

                <View style={styles.contactContent}>
                  <Text style={styles.contactLabel}>Phone Number</Text>
                  <TextInput
                    value={formatPhoneNumber(phoneNumber)}
                    onChangeText={handlePhoneChange}
                    placeholder="Enter phone number..."
                    keyboardType="phone-pad"
                    style={styles.contactInput}
                    maxLength={14} // (XXX) XXX-XXXX format
                  />
                </View>
              </Animated.View>
            </PanGestureHandler>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionValue: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  listItem: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  profilePictureContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  measurementsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  measurementText: {
    fontSize: 16,
    color: '#6B7280',
  },
  // Bottom Sheet Styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  fullHeightSheet: {
    maxHeight: '90%',
    minHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  done: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  // Measurements Sheet Styles
  measurementsContent: {
    padding: 20,
  },
  measurementGroup: {
    marginBottom: 30,
  },
  measurementLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 20,
  },
  pickerContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  picker: {
    height: 150,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#111',
  },
  pickerItemTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  // Achievements Sheet Styles
  achievementsContent: {
    padding: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 12,
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  // Social Links Sheet Styles
  socialLinksContent: {
    padding: 20,
  },
  socialLinkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialLinkInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 12,
  },
  // Contact Sheet Styles
  contactContent: {
    padding: 20,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 12,
  },
  contactInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    height: 48,
    backgroundColor: '#fff',
  },
});