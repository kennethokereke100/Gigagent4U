import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserRole } from '../../contexts/UserRoleContext';
import { auth, db } from '../../firebaseConfig';
import { createApplicationNotification } from '../../utils/createApplicationNotification';

const BG = '#F5F3F0';
const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/gigplaceholder/800/450';

export default function EventDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role } = useUserRole();
  
  const [eventData, setEventData] = useState<any>(null);
  const [promoterProfile, setPromoterProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Params passed from list item; provide sensible fallbacks
  const {
    title = 'Looking for New Wrestlers',
    dateLine = 'Wed, July 24 • 6:00 – 8:00 PM EDT',
    venue = '1010 Nicollet Mall, Minneapolis, MN 55403, USA',
    promoterName = 'Allison Perez',
    promoterRole = 'Promoter',
    // groupName = 'Wrestling Group',
    priceText = 'Gig Price: $120',
    city = 'New York City',
    heroUri,
    // Additional fields for user-created events
    description,
    address,
    contactInfo,
    // gigGroupName,
    hourlyAmount,
    startDate,
    endDate,
    time,
    photoUri,
    photoUrl,
    location,
    userId, // Promoter's user ID
    eventId, // Event ID for applying
  } = useLocalSearchParams<{
    title?: string;
    dateLine?: string;
    venue?: string;
    promoterName?: string;
    promoterRole?: string;
    // groupName?: string;
    priceText?: string;
    city?: string;
    heroUri?: string;
    // Additional fields for user-created events
    description?: string;
    address?: string;
    contactInfo?: string;
    // gigGroupName?: string;
    hourlyAmount?: string;
    startDate?: string;
    endDate?: string;
    time?: string;
    photoUri?: string;
    photoUrl?: string;
    location?: string;
    userId?: string;
    eventId?: string;
  }>();

  // Fetch event data and promoter profile
  useEffect(() => {
    const fetchEventAndPromoterData = async () => {
      console.log('🔍 Fetching event data for eventId:', eventId);
      
      if (!eventId) {
        console.log('⚠️ No eventId provided, using fallback data');
        setLoading(false);
        return;
      }

      try {
        // 1. Fetch event document from Firestore
        const eventRef = doc(db, 'posts', eventId);
        const eventSnap = await getDoc(eventRef);
        
        if (eventSnap.exists()) {
          const eventDocData = eventSnap.data();
          console.log('✅ Event document found:', eventDocData);
          setEventData(eventDocData);
          
          // 2. Fetch promoter profile using userId from event document
          const promoterUserId = eventDocData.userId;
          console.log('🔍 Fetching promoter profile for userId:', promoterUserId);
          
          if (promoterUserId) {
            const profileRef = doc(db, 'profiles', promoterUserId);
            const profileSnap = await getDoc(profileRef);
            
            if (profileSnap.exists()) {
              const profileData = profileSnap.data();
              console.log('✅ Promoter profile found:', profileData);
              setPromoterProfile(profileData);
            } else {
              console.log('⚠️ Promoter profile not found in Firestore for userId:', promoterUserId);
              console.log('📋 Will show fallback data instead');
            }
          }
        } else {
          console.log('⚠️ Event document not found in Firestore');
        }
      } catch (error) {
        console.error('❌ Error fetching event and promoter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEventAndPromoterData();
  }, [eventId]);

  // Handler functions
  const handlePromoterAvatarPress = () => {
    const promoterUserId = eventData?.userId || userId;
    if (promoterUserId) {
      router.push({
        pathname: '/screen/savedprofile',
        params: { userId: promoterUserId }
      });
    }
  };

  const handleViewPromoterDetails = () => {
    const promoterUserId = eventData?.userId || userId;
    const promoterName = promoterProfile?.name || promoterProfile?.nickname || promoterName;
    const eventTitle = eventData?.title || title;
    
    if (promoterUserId) {
      router.push({
        pathname: '/screen/savedprofile',
        params: { 
          promoterId: promoterUserId,
          promoterName: promoterName,
          eventId: eventId,
          eventTitle: eventTitle
        }
      });
    }
  };

  const handleCall = () => {
    console.log('📞 Call button pressed!');
    const phoneNumber = promoterProfile?.contact;
    const promoterName = promoterProfile?.name || promoterProfile?.nickname || 'the promoter';
    console.log('📱 Phone number:', phoneNumber);
    console.log('👤 Promoter profile:', promoterProfile);
    
    if (!phoneNumber) {
      console.log('❌ No phone number available');
      Alert.alert('Error', 'No phone number available for this promoter');
      return;
    }

    Alert.alert(
      'Call Promoter',
      `You are calling ${promoterName}. Call or Cancel.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: async () => {
            try {
              const phoneUrl = `tel:${phoneNumber}`;
              const canOpen = await Linking.canOpenURL(phoneUrl);
              
              if (canOpen) {
                await Linking.openURL(phoneUrl);
              } else {
                // Fallback: copy to clipboard
                await Clipboard.setStringAsync(phoneNumber);
                Alert.alert('Phone number copied to clipboard', phoneNumber);
              }
            } catch (error) {
              console.error('Error opening phone app:', error);
              // Fallback: copy to clipboard
              await Clipboard.setStringAsync(phoneNumber);
              Alert.alert('Phone number copied to clipboard', phoneNumber);
            }
          }
        }
      ]
    );
  };

  const handleMessage = () => {
    console.log('💬 Message button pressed!');
    const promoterUserId = eventData?.userId || userId;
    const promoterName = promoterProfile?.name || promoterProfile?.nickname || 'Promoter';
    
    router.push({
      pathname: '/screen/Message',
      params: {
        promoterId: promoterUserId,
        promoterName: promoterName,
        fromScreen: 'gigs' // This tells Message.tsx to navigate back to gig list with bottom nav
      }
    });
  };

  const handleApply = async () => {
    console.log('🎯 Apply button pressed!');
    const promoterUserId = eventData?.userId || userId;
    console.log('📊 Current state:', { role, eventId, promoterUserId, currentUser: auth.currentUser?.uid });
    
    if (role !== 'talent') {
      console.log('❌ User is not a talent, role:', role);
      Alert.alert('Error', 'Only talent users can apply to gigs');
      return;
    }

    if (!eventId || !promoterUserId) {
      console.log('❌ Missing required data:', { eventId, promoterUserId });
      Alert.alert('Error', 'Event or promoter information not found');
      return;
    }

    if (!auth.currentUser) {
      console.log('❌ User not authenticated');
      Alert.alert('Error', 'You must be logged in to apply');
      return;
    }

    try {
      console.log('🔄 Getting talent profile...');
      // Get talent name from profile
      const talentProfileRef = doc(db, 'profiles', auth.currentUser.uid);
      const talentProfileSnap = await getDoc(talentProfileRef);
      const talentName = talentProfileSnap.exists() ? talentProfileSnap.data().name : 'Unknown Talent';
      console.log('👤 Talent name:', talentName);

      console.log('🔄 Creating application and notifications...');
      // Create application and notifications
      await createApplicationNotification(
        eventId,
        promoterUserId, // promoter user ID from event data
        auth.currentUser.uid, // talent user ID
        talentName,
        String(eventData?.title || title)
      );

      console.log('✅ Application created successfully!');
      Alert.alert(
        'Success!',
        'Your application has been submitted successfully. You will be notified when the promoter responds.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error applying to gig:', error);
      Alert.alert('Error', 'Failed to apply to gig. Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.heroWrap}>
          <Image
            source={{ uri: photoUrl || photoUri || heroUri || PLACEHOLDER_IMAGE }}
            style={styles.hero}
            resizeMode="cover"
          />
          {/* top chrome */}
          <View style={[styles.chrome, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={styles.roundIcon} hitSlop={10}>
              <Ionicons name="chevron-back" size={20} color="#111" />
            </Pressable>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable style={styles.roundIcon} hitSlop={10}>
                <Ionicons name="share-outline" size={18} color="#111" />
              </Pressable>
              <Pressable style={styles.roundIcon} hitSlop={10}>
                <Ionicons name="heart-outline" size={18} color="#111" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* TITLE BLOCK */}
        <View style={styles.cardTop}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subTitle}>{city}</Text>
        </View>

        {/* STATS ROW (ratings / badges placeholder) */}
        <View style={styles.pillsRow}>
          <View style={styles.pill}>
            <Ionicons name="star" size={14} color="#111" />
            <Text style={styles.pillText}>4.9</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="trophy-outline" size={14} color="#111" />
            <Text style={styles.pillText}>Featured</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="chatbubble-ellipses-outline" size={14} color="#111" />
            <Text style={styles.pillText}>298 reviews</Text>
          </View>
        </View>

        {/* TIME & VENUE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Time & venue</Text>
          <View style={{ gap: 6 }}>
            <Row icon="time-outline" text={String(dateLine)} />
            <Row icon="location-outline" text={String(venue)} />
          </View>
          <View style={styles.rowButtons}>
            <Secondary onPress={() => { /* TODO: link to maps */ }} label="Directions" icon="navigate-outline" />
            <Secondary onPress={() => { /* TODO: start call */ }} label="Call venue" icon="call-outline" />
          </View>
        </View>

        {/* GIG TYPE / TAGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gig details</Text>
          <Text style={styles.muted}>See if this gig fits you. Categories help promoters find the right talent.</Text>
          <View style={styles.chips}>
            {['Wrestler', 'Audition', 'Paid', 'Beginner friendly'].map((t) => (
              <View key={t} style={styles.chip}><Text style={styles.chipText}>{t}</Text></View>
            ))}
          </View>
        </View>

        {/* GIG CONTACT / PROMOTER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gig contact</Text>
          
          {/* Show real promoter data if available */}
          {promoterProfile ? (
            <>
              <Pressable style={styles.promoterCard} onPress={handlePromoterAvatarPress}>
                <Image
                  source={{ uri: promoterProfile.photoUrl || 'https://i.pravatar.cc/84' }}
                  style={styles.avatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.promoterName}>
                    {promoterProfile.name || promoterProfile.nickname || 'Unknown Promoter'}
                  </Text>
                  <Text style={styles.muted}>
                    {promoterProfile.role || 'Promoter'}
                  </Text>
                </View>
                <Pressable style={styles.ghostIcon} hitSlop={10} onPress={handleMessage}>
                  <Ionicons name="chatbubbles-outline" size={18} color="#111" />
                  <Text style={styles.ghostLabel}>Chat</Text>
                </Pressable>
              </Pressable>
              <View style={styles.rowButtons}>
                <Secondary onPress={handleCall} label="Call" icon="call-outline" />
                <Secondary onPress={handleMessage} label="Message" icon="paper-plane-outline" />
              </View>
              <Pressable style={styles.viewDetailsButton} onPress={handleViewPromoterDetails}>
                <Text style={styles.viewDetailsText}>View Promoter Details</Text>
                <Ionicons name="chevron-forward" size={16} color="#6B7280" />
              </Pressable>
            </>
          ) : (
            /* Show fallback for Google events or when no promoter data */
            <View style={styles.promoterCard}>
              <Image
                source={{ uri: 'https://i.pravatar.cc/84' }}
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.promoterName}>
                  {promoterName || 'Contact TBD'}
                </Text>
                <Text style={styles.muted}>
                  {promoterRole || 'Event Organizer'}
                </Text>
              </View>
              <View style={styles.ghostIcon}>
                <Ionicons name="information-circle-outline" size={18} color="#6B7280" />
                <Text style={[styles.ghostLabel, { color: '#6B7280' }]}>Info</Text>
              </View>
            </View>
          )}
        </View>

        {/* GROUP */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Group</Text>
          <View style={styles.groupRow}>
            <Text style={styles.groupName}>{groupName}</Text>
            <Pressable style={styles.followBtn}>
              <Text style={styles.followText}>Follow</Text>
            </Pressable>
          </View>
        </View> */}

        {/* PRICE + CTA */}
        <View style={styles.bottomPad} />
      </ScrollView>

      {/* sticky footer CTA */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.priceTop}>{priceText}</Text>
          <Text style={styles.mutedSmall}>All fees included</Text>
        </View>
        {role === 'talent' && (
          <Pressable style={styles.cta} onPress={handleApply}>
            <Text style={styles.ctaText}>Apply</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Row({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color="#111" />
      <Text style={styles.rowText}>{text}</Text>
    </View>
  );
}

function Secondary({ label, icon, onPress }: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryBtn}>
      <Ionicons name={icon} size={16} color="#111" />
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heroWrap: { position: 'relative' },
  hero: { width: '100%', height: 280, backgroundColor: '#E5E7EB' },
  chrome: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  roundIcon: {
    height: 36, width: 36, borderRadius: 18, backgroundColor: '#ffffffCC',
    alignItems: 'center', justifyContent: 'center'
  },

  cardTop: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 6, backgroundColor: BG },
  title: { fontSize: 26, fontWeight: '800', color: '#111', lineHeight: 32 },
  subTitle: { marginTop: 4, fontSize: 15, color: '#6B7280' },

  pillsRow: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16, flexDirection: 'row', gap: 10 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: '#fff' },
  pillText: { fontSize: 13, color: '#111' },

  section: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 14, gap: 10 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111' },
  muted: { color: '#6B7280', fontSize: 14 },
  mutedSmall: { color: '#6B7280', fontSize: 12 },

  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowText: { fontSize: 15, color: '#111', flex: 1, lineHeight: 20 },

  rowButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff'
  },
  secondaryText: { color: '#111', fontWeight: '600' },

  promoterCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { height: 42, width: 42, borderRadius: 21, backgroundColor: '#E5E7EB' },
  promoterName: { fontSize: 16, fontWeight: '700', color: '#111' },
  ghostIcon: { alignItems: 'center' },
  ghostLabel: { fontSize: 12, color: '#111', marginTop: 2 },

  groupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupName: { fontSize: 16, fontWeight: '600', color: '#111' },
  followBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#111' },
  followText: { color: '#fff', fontWeight: '700' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#EEF2F5', borderRadius: 18 },
  chipText: { fontSize: 13, color: '#111' },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
  },
  priceTop: { fontSize: 16, fontWeight: '800', color: '#111' },
  cta: { height: 48, paddingHorizontal: 20, backgroundColor: '#111', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontWeight: '800' },
  bottomPad: { height: 12 }
});
