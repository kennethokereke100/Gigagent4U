import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';
import { createPostInFirestore, PostData } from '../../utils/createPostInFirestore';

const BG = '#F5F3F0';
const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/gigplaceholder/800/450';

export default function EventDetailPreview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isPosting, setIsPosting] = useState(false);

  // Get event data from navigation params
  const {
    category = 'Event',
    title = 'Event Title',
    description = 'Event description',
    address = 'Event address',
    contactInfo = 'Contact info',
    // gigGroupName = 'Group name',
    hourlyAmount = '$0',
    startDate = '',
    endDate = '',
    time = '',
    photoUri = '',
    coverImage = '',
    location = '',
  } = useLocalSearchParams<{
    category?: string;
    title?: string;
    description?: string;
    address?: string;
    contactInfo?: string;
    // gigGroupName?: string;
    hourlyAmount?: string;
    startDate?: string;
    endDate?: string;
    time?: string;
    photoUri?: string;
    coverImage?: string;
    location?: string;
  }>();

  const handlePost = async () => {
    if (isPosting) return;
    
    setIsPosting(true);
    try {
      // Create the post data object for Firestore
      const postData: PostData = {
        userId: auth.currentUser!.uid,
        type: "promoter",
        photoUrl: coverImage || photoUri || PLACEHOLDER_IMAGE,
        title: title.trim(),
        description: description.trim(),
        address: address.trim(),
        startDate: startDate || '',
        endDate: endDate || '',
        time: time || 'Time TBD',
        contact: contactInfo.trim(),
        gigPrice: parseFloat(hourlyAmount.replace(/[^0-9.]/g, '')) || 0,
      };

      // Post to Firestore
      const postId = await createPostInFirestore(postData);
      console.log('✅ Event posted successfully with ID:', postId);

      // Check if this is the user's first post and send notification
      try {
        const userPostsQuery = query(
          collection(db, 'posts'),
          where('userId', '==', auth.currentUser!.uid)
        );
        const userPostsSnapshot = await getDocs(userPostsQuery);
        
        // If this is the first post (only 1 document in the query result)
        if (userPostsSnapshot.docs.length === 1) {
          await addDoc(collection(db, 'notifications'), {
            userId: auth.currentUser!.uid,
            message: "Congratulations on your first event! Now invite a talent.",
            cta: "Invite Talent",
            createdAt: new Date(),
            read: false,
          });
          console.log('🎉 First post notification sent!');
        }
      } catch (notificationError) {
        console.error('❌ Error sending first post notification:', notificationError);
        // Don't fail the post if notification fails
      }

      // Show success message
      Alert.alert(
        'Success!',
        'Your event has been posted successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to eventlist with Gig tab active to view the posted event
              router.replace('/screen/eventlist');
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error posting event:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to post your event. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Permission denied. Please check your authentication.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('quota')) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        }
      }
      
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    } finally {
      setIsPosting(false);
    }
  };

  const handleEdit = () => {
    // Navigate to CreateEvent with prefilled data
    router.push({
      pathname: '/screen/CreateEvent',
      params: {
        category,
        title,
        description,
        address,
        contactInfo,
        // gigGroupName,
        hourlyAmount,
        startDate,
        endDate,
        time,
        photoUri,
        coverImage,
        location,
      }
    });
  };

  // Format date range and time
  const formatDateTime = () => {
    let dateTime = '';
    if (startDate && endDate) {
      dateTime += `${startDate} - ${endDate}`;
    } else if (startDate) {
      dateTime += startDate;
    }
    if (time) {
      dateTime += dateTime ? ` • ${time}` : time;
    }
    if (dateTime) {
      dateTime += ' EDT'; // Default timezone
    }
    return dateTime || 'Date & time TBD';
  };

  // Resolve venue from address (placeholder for Google Maps API)
  const resolveVenue = () => {
    // TODO: Implement Google Maps API call to resolve address to venue name
    // For now, use the address as fallback
    return address || 'Venue TBD';
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
            source={{ uri: coverImage || photoUri || PLACEHOLDER_IMAGE }}
            style={styles.hero}
            resizeMode="cover"
          />
          {/* top chrome */}
          <View style={[styles.chrome, { paddingTop: insets.top + 8 }]}>
            <Pressable onPress={() => router.back()} style={styles.roundIcon} hitSlop={10}>
              <Ionicons name="close" size={20} color="#111" />
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
          <Text style={styles.subTitle}>{resolveVenue()}</Text>
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
            <Row icon="time-outline" text={formatDateTime()} />
            <Row icon="location-outline" text={String(address)} />
          </View>
          <View style={styles.rowButtons}>
            <Secondary onPress={() => { /* TODO: link to maps */ }} label="Directions" icon="navigate-outline" />
            <Secondary onPress={() => { /* TODO: start call */ }} label="Call venue" icon="call-outline" />
          </View>
        </View>

        {/* GIG DESCRIPTION (replaces Gig details) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gig Description</Text>
          <Text style={styles.muted}>{description}</Text>
        </View>

        {/* GIG CONTACT / PROMOTER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gig contact</Text>
          <View style={styles.promoterCard}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={24} color="#6B7280" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.promoterName}>Contact</Text>
              <Text style={styles.muted}>{contactInfo}</Text>
            </View>
            <Pressable style={styles.ghostIcon} hitSlop={10} onPress={() => { /* TODO: open chat */ }}>
              <Ionicons name="chatbubbles-outline" size={18} color="#111" />
              <Text style={styles.ghostLabel}>Chat</Text>
            </Pressable>
          </View>
          <View style={styles.rowButtons}>
            <Secondary onPress={() => { /* TODO: call contact */ }} label="Call" icon="call-outline" />
            <Secondary onPress={() => { /* TODO: message contact */ }} label="Message" icon="paper-plane-outline" />
          </View>
        </View>

        {/* GROUP SECTION (replaces Group) */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gig Group</Text>
          <View style={styles.groupRow}>
            <Text style={styles.groupName}>{gigGroupName}</Text>
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
          <Text style={styles.priceTop}>Gig Price: {hourlyAmount}</Text>
          <Text style={styles.mutedSmall}>All fees included</Text>
        </View>
        <View style={styles.footerButtons}>
          <Pressable 
            style={[styles.cta, isPosting && styles.ctaDisabled]} 
            onPress={handlePost}
            disabled={isPosting}
          >
            <Text style={styles.ctaText}>
              {isPosting ? 'Posting...' : 'Post'}
            </Text>
          </Pressable>
          <Pressable 
            style={[styles.editButton, isPosting && styles.editButtonDisabled]} 
            onPress={handleEdit}
            disabled={isPosting}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
        </View>
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
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff'
  },
  secondaryText: { color: '#111', fontWeight: '600' },

  promoterCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarPlaceholder: { 
    height: 42, 
    width: 42, 
    borderRadius: 21, 
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center'
  },
  promoterName: { fontSize: 16, fontWeight: '700', color: '#111' },
  ghostIcon: { alignItems: 'center' },
  ghostLabel: { fontSize: 12, color: '#111', marginTop: 2 },

  groupRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  groupName: { fontSize: 16, fontWeight: '600', color: '#111' },
  followBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#111' },
  followText: { color: '#fff', fontWeight: '700' },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceTop: { fontSize: 16, fontWeight: '800', color: '#111' },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cta: { 
    flex: 1,
    height: 48, 
    backgroundColor: '#111', 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  ctaText: { color: '#fff', fontWeight: '800' },
  editButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  editButtonText: {
    color: '#111',
    fontWeight: '600',
  },
  ctaDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  editButtonDisabled: {
    opacity: 0.6,
  },
  bottomPad: { height: 12 }
});
