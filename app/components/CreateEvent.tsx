import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateRangePicker from '../../components/DateRangePicker';
import PhotoUpload from '../../components/PhotoUpload';
import TimePicker from '../../components/TimePicker';
import { useUserLocation } from '../../contexts/UserLocationContext';

interface CreateEventProps {
  onPost: (eventData: any) => void;
}

export default function CreateEvent({ onPost }: CreateEventProps) {
  const { city, state } = useUserLocation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [locationSheetVisible, setLocationSheetVisible] = useState(false);
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);

  const handleDateRangeSelect = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handlePhotoSelect = (uri: string) => {
    setPhotoUri(uri);
  };

  const handlePost = () => {
    if (!title.trim()) return; // Title is required
    
    // Create location string from context
    const locationString = city && state ? `${city}, ${state}` : city || '';
    
    const eventData = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      startDate,
      endDate,
      time,
      location: locationString,
      photoUri,
      mediaType: 'photo',
      postedAt: new Date().toISOString(),
      pillar: 'Event', // Default category
      priceFrom: '$0', // Default price
      venue: locationString,
      distanceMi: 0, // Will be calculated based on user location
      startsAt: new Date().toISOString(), // Will be calculated from date/time
      endsAt: new Date().toISOString(), // Will be calculated from date/time
    };
    
    onPost(eventData);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Photo Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Showcase your event</Text>
        <Text style={styles.sectionDescription}>
          Upload a cover photo to highlight your event
        </Text>
        <PhotoUpload 
          onSelect={handlePhotoSelect}
          placeholder="Upload photo"
          value={photoUri}
        />
      </View>

      {/* Event Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Info</Text>
        
        {/* Title Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Gig title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter event title"
            placeholderTextColor="#9CA3AF"
          />
        </View>

        {/* Description Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Gig description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us about your event and what makes it special, such as the type of event or your experience in organizing similar events."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{description.length}/500</Text>
        </View>

        {/* Address Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Address</Text>
          <Pressable 
            style={styles.addressInput}
            onPress={() => setAddressSheetVisible(true)}
          >
            <Text style={[styles.addressInputText, !address && styles.placeholder]}>
              {address || "Enter address"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </Pressable>
        </View>

        {/* Event Location Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Event Location</Text>
          
          {/* Location Pill */}
          <View style={styles.locationPill}>
            <Ionicons name="location-sharp" size={18} color="#6B7280" />
            <Ionicons name="map" size={16} color="#6B7280" style={{ marginLeft: 4 }} />
            <Text style={styles.locationPillText}>
              {city && state ? `${city}, ${state}` : city || "No location selected"}
            </Text>
          </View>
          
          {/* Change Location Button */}
          <Pressable 
            style={styles.changeLocationButton}
            onPress={() => setLocationSheetVisible(true)}
          >
            <Text style={styles.changeLocationText}>Change location</Text>
          </Pressable>
        </View>
      </View>

      {/* Date and Time Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date and Time</Text>
        
        {/* Date Range Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Date Range</Text>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onSelect={handleDateRangeSelect}
            placeholder="Select start and end dates"
          />
        </View>

        {/* Time Picker */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Time</Text>
          <TimePicker
            value={time}
            onSelect={setTime}
            placeholder="Select time"
          />
        </View>
      </View>



      {/* Post Button */}
      <View style={styles.section}>
        <Pressable 
          style={[styles.postButton, !title.trim() && styles.postButtonDisabled]} 
          onPress={handlePost}
          disabled={!title.trim()}
        >
          <Text style={styles.postButtonText}>Post</Text>
        </Pressable>
      </View>
      
      {/* Location Bottom Sheet */}
      <Modal
        visible={locationSheetVisible}
        transparent
        animationType="slide"
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setLocationSheetVisible(false)}
        >
          <Pressable 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setLocationSheetVisible(false)}>
                <Text style={styles.headerButton}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Change Location</Text>
              <View style={{ width: 60 }} />
            </View>
            
            {/* Content - Empty for now */}
            <View style={styles.modalBody}>
              <Text style={styles.modalBodyText}>
                Location picker will be implemented here
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Address Bottom Sheet */}
      <Modal
        visible={addressSheetVisible}
        transparent
        animationType="slide"
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setAddressSheetVisible(false)}
        >
          <Pressable 
            style={[styles.modalContent, { height: '55%' }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setAddressSheetVisible(false)}>
                <Text style={styles.headerButton}>Cancel</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Select Address</Text>
              <View style={{ width: 60 }} />
            </View>
            
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#6B7280" />
                <Text style={styles.searchBarPlaceholder}>Search Baltimore addresses...</Text>
              </View>
            </View>
            
            {/* Content - Empty for now */}
            <View style={styles.modalBody}>
              <Text style={styles.modalBodyText}>
                Address picker will be implemented here
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },

  postButton: {
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  postButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    gap: 8,
  },
  locationPillText: {
    fontSize: 16,
    color: '#111',
    flex: 1,
  },
  changeLocationButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  changeLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  modalBodyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  searchBarContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  searchBarPlaceholder: {
    fontSize: 16,
    color: '#9CA3AF',
    flex: 1,
  },
});
