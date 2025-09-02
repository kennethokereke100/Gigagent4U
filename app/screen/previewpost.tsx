import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';

export default function PreviewPost() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Get event data from navigation params
  const {
    title = 'Event Title',
    description = 'Event description',
    address = 'Event address',
    contactInfo = 'Contact info',
    gigGroupName = 'Group name',
    hourlyAmount = '$0',
    startDate = '',
    endDate = '',
    time = '',
    photoUri = '',
    location = '',
  } = useLocalSearchParams<{
    title?: string;
    description?: string;
    address?: string;
    contactInfo?: string;
    gigGroupName?: string;
    hourlyAmount?: string;
    startDate?: string;
    endDate?: string;
    time?: string;
    photoUri?: string;
    location?: string;
  }>();

  const handleNext = () => {
    // Navigate to event detail preview with all data
    router.push({
      pathname: '/screen/eventdetailpreview',
      params: {
        title,
        description,
        address,
        contactInfo,
        gigGroupName,
        hourlyAmount,
        startDate,
        endDate,
        time,
        photoUri,
        location,
      }
    });
  };

  const handleEdit = () => {
    // Return to create event with data preserved
    router.back();
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={20} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Preview Post</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Card Preview Section - Centered */}
      <View style={styles.previewContainer}>
        <View style={styles.cardPreview}>
          {/* Cover Photo */}
          <View style={styles.photoContainer}>
            <Image
              source={
                photoUri
                  ? { uri: String(photoUri) }
                  : { uri: 'https://picsum.photos/seed/eventpreview/400/200' }
              }
              style={styles.coverPhoto}
              resizeMode="cover"
            />
            {/* Overlay Tags */}
            <View style={styles.tagOverlay}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Posted</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>Event</Text>
              </View>
            </View>
          </View>

          {/* Card Content */}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDateTime}>{formatDateTime()}</Text>
            <Text style={styles.cardVenue}>{resolveVenue()}</Text>
            <Text style={styles.cardDistance}>1.2 miles away</Text>
          </View>
        </View>
      </View>

      {/* Sticky Footer with Drop Shadow */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.footerContent}>
          <Pressable style={styles.primaryButton} onPress={handleNext}>
            <Text style={styles.primaryButtonText}>Next</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={handleEdit}>
            <Text style={styles.secondaryButtonText}>Edit Post</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: BG,
  },
  backButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#ffffffCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardPreview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photoContainer: {
    position: 'relative',
    height: 200,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  tagOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tag: {
    backgroundColor: '#ffffffCC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  cardDateTime: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardVenue: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  cardDistance: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  footerContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#111',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  secondaryButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
});
