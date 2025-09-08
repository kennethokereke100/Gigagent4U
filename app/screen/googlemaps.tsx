import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateRangePicker from '../../components/DateRangePicker';
import GigHourlySheet from '../../components/GigHourlySheet';
import TimePicker from '../../components/TimePicker';
import { auth, db } from '../../firebaseConfig';
import { validateGoogleEventData } from '../../utils/ensureGoogleEventFields';

const TALENT_CATEGORIES = [
  'UFC Athlete',
  'Boxer',
  'Wrestler',
  'Comedian',
  'Musician',
  'Referee',
  'Ring Announcer',
  'Cutman',
  'Coach',
  'Other',
];

export default function GoogleMaps() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    venueId?: string;
    venueName?: string;
    venueAddress?: string;
    venuePhotoRef?: string;
  }>();

  const [eventTitle, setEventTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [hourlyAmount, setHourlyAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [hourlySheetVisible, setHourlySheetVisible] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategory(prev => prev === category ? '' : category);
  };

  const handleDateRangeSelect = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleHourlyAmountSelect = (amount: string) => {
    setHourlyAmount(amount);
    setHourlySheetVisible(false);
  };

  const handlePostEvent = async () => {
    if (isPosting) return;
    setIsPosting(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "You must be logged in to post an event.");
        return;
      }

      // Build event object with all required fields for Firestore security rules
      const rawEventData = {
        // Required fields for Firestore security rules
        title: eventTitle.trim(),
        venue: params.venueName || 'Unknown Venue',
        dateLine: `${startDate.trim()} • ${time.trim()}`,
        createdBy: user.uid,        // MUST be included for security rules
        userId: user.uid,           // alias for promoter ID
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Additional event data
        eventTitle: eventTitle.trim(),
        venueName: params.venueName || 'Unknown Venue',
        venueAddress: params.venueAddress || 'Unknown Address',
        venuePhoto: params.venuePhotoRef || '',
        description: description.trim(),
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        time: time.trim(),
        gigPrice: parseFloat(hourlyAmount) || 0,
        category: selectedCategory,
      };

      // Validate and ensure all required fields are present
      const eventData = validateGoogleEventData(rawEventData);

      // Save to Firestore in googleevents collection
      await addDoc(collection(db, "googleevents"), eventData);

      Alert.alert("Success", "Event posted successfully!");
      router.push("/screen/eventlist"); // Navigate back to eventlist (gig tab)
    } catch (error) {
      console.error("Error posting event:", error);
      Alert.alert("Error", "Failed to post event. Please try again.");
    } finally {
      setIsPosting(false);
    }
  };

  const getVenueImageUrl = () => {
    if (params.venuePhotoRef && params.venuePhotoRef !== 'mock_photo_ref_1' && params.venuePhotoRef !== 'mock_photo_ref_2' && params.venuePhotoRef !== 'mock_photo_ref_3') {
      // For real Google Places API, you would use:
      // return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${params.venuePhotoRef}&key=YOUR_ACTUAL_API_KEY`;
      
      // For now, return a placeholder since we don't have a real API key
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center';
    }
    
    // Use venue-specific placeholder images for mock data
    const venueName = params.venueName?.toLowerCase() || '';
    if (venueName.includes('madison square')) {
      return 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('barclays')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('radio city')) {
      return 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('yankee') || venueName.includes('stadium')) {
      return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('citi field') || venueName.includes('field')) {
      return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('staples') || venueName.includes('center')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('hollywood bowl') || venueName.includes('bowl')) {
      return 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('dodger')) {
      return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('united center') || venueName.includes('wrigley')) {
      return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('baltimore') || venueName.includes('orioles') || venueName.includes('camden')) {
      return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('miami') || venueName.includes('american airlines') || venueName.includes('hard rock')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('boston') || venueName.includes('td garden') || venueName.includes('fenway')) {
      return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('philadelphia') || venueName.includes('wells fargo') || venueName.includes('citizens bank')) {
      return 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800&h=400&fit=crop&crop=center';
    } else if (venueName.includes('atlanta') || venueName.includes('state farm') || venueName.includes('mercedes-benz')) {
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&crop=center';
    }
    
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </Pressable>
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Venue Photo */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: getVenueImageUrl() }}
            style={styles.venuePhoto}
            defaultSource={{
              uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop&crop=center',
            }}
          />
        </View>

        {/* Event & Venue Info */}
        <View style={styles.venueInfo}>
          <Text style={styles.eventTitle}>{eventTitle || "Untitled Event"}</Text>
          <Text style={styles.venueTitle}>{params.venueName || 'Unknown Venue'}</Text>
          <Text style={styles.venueAddress}>{params.venueAddress || 'Unknown Address'}</Text>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesContainer}>
            {TALENT_CATEGORIES.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryPill,
                  selectedCategory === category && styles.categoryPillSelected,
                ]}
                onPress={() => handleCategoryToggle(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              value={eventTitle}
              onChangeText={setEventTitle}
              placeholder="Enter event title"
              style={styles.input}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your event..."
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Date Range *</Text>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onSelect={handleDateRangeSelect}
              placeholder="Select start and end dates"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Time *</Text>
            <TimePicker
              value={time}
              onSelect={setTime}
              placeholder="Select time"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gig Hourly Amount *</Text>
            <Pressable 
              style={styles.addressInput}
              onPress={() => setHourlySheetVisible(true)}
            >
              {hourlyAmount && (
                <Ionicons name="cash-outline" size={16} color="#6B7280" style={styles.addressIcon} />
              )}
              <Text style={[styles.addressInputText, !hourlyAmount && styles.placeholder]}>
                {hourlyAmount || "Enter hourly amount"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* Post Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.postButton, isPosting && styles.postButtonDisabled]}
            onPress={handlePostEvent}
            disabled={isPosting}
          >
            <Text style={styles.postButtonText}>
              {isPosting ? 'Posting...' : 'Post Event'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Gig Hourly Amount Bottom Sheet */}
      <GigHourlySheet
        visible={hourlySheetVisible}
        onClose={() => setHourlySheetVisible(false)}
        onSelectAmount={handleHourlyAmountSelect}
      />
    </SafeAreaView>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  scrollView: {
    flex: 1,
  },
  photoContainer: {
    padding: 16,
  },
  venuePhoto: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  venueInfo: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
    marginTop: 8,
  },
  venueTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 4,
  },
  venueAddress: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryPillSelected: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  postButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  addressInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  addressInputText: {
    fontSize: 16,
    color: '#111',
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  addressIcon: {
    marginRight: 8,
  },
});
