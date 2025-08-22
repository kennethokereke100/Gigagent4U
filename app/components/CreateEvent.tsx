import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import DateRangePicker from '../../components/DateRangePicker';
import PhotoVideoUpload from '../../components/PhotoVideoUpload';
import TimePicker from '../../components/TimePicker';

interface CreateEventProps {
  onPost: (eventData: any) => void;
}

export default function CreateEvent({ onPost }: CreateEventProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [mediaUri, setMediaUri] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');

  const handleDateRangeSelect = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handleMediaSelect = (uri: string, type: 'photo' | 'video') => {
    setMediaUri(uri);
    setMediaType(type);
  };

  const handlePost = () => {
    if (!title.trim()) return; // Title is required
    
    const eventData = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      startDate,
      endDate,
      time,
      location: location.trim(),
      mediaUri,
      mediaType,
      postedAt: new Date().toISOString(),
      pillar: 'Event', // Default category
      priceFrom: '$0', // Default price
      venue: location.trim(),
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
          Upload a cover photo or video to highlight your event
        </Text>
        <PhotoVideoUpload 
          onSelect={handleMediaSelect}
          placeholder="Upload photo or video"
        />
      </View>

      {/* Event Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Event Info</Text>
        
        {/* Title Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Title *</Text>
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
          <Text style={styles.fieldLabel}>Description</Text>
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

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Event Location</Text>
          <TextInput
            style={styles.textInput}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter event location"
            placeholderTextColor="#9CA3AF"
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
});
