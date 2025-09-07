import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import BottomSheetAddressPicker from '../../components/BottomSheetAddressPicker';
import DateRangePicker from '../../components/DateRangePicker';
import GigHourlySheet from '../../components/GigHourlySheet';
import PhotoUpload from '../../components/PhotoUpload';
import TimePicker from '../../components/TimePicker';

interface CreateEventFormProps {
  // Form values
  title: string;
  description: string;
  address: string;
  // gigGroupName: string;
  hourlyAmount: string;
  startDate: string;
  endDate: string;
  time: string;
  photoUri: string;
  coverImage: string;
  isUploading: boolean;
  
  // State setters
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setAddress: (value: string) => void;
  // setGigGroupName: (value: string) => void;
  setHourlyAmount: (value: string) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setTime: (value: string) => void;
  setPhotoUri: (value: string) => void;
  
  // Bottom sheet states
  addressSheetVisible: boolean;
  hourlySheetVisible: boolean;
  setAddressSheetVisible: (visible: boolean) => void;
  setHourlySheetVisible: (visible: boolean) => void;
  
  // Form validation
  isFormComplete: () => boolean;
  
  // Submit handler
  onSubmit: () => void;
}

export default function CreateEventForm({
  title,
  description,
  address,
  // gigGroupName,
  hourlyAmount,
  startDate,
  endDate,
  time,
  photoUri,
  coverImage,
  isUploading,
  setTitle,
  setDescription,
  setAddress,
  // setGigGroupName,
  setHourlyAmount,
  setStartDate,
  setEndDate,
  setTime,
  setPhotoUri,
  addressSheetVisible,
  hourlySheetVisible,
  setAddressSheetVisible,
  setHourlySheetVisible,
  isFormComplete,
  onSubmit
}: CreateEventFormProps) {

  const handleDateRangeSelect = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  const handlePhotoSelect = (uri: string) => {
    setPhotoUri(uri);
  };

  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setAddressSheetVisible(false);
  };

  const handleHourlyAmountSelect = (amount: string) => {
    setHourlyAmount(amount);
    setHourlySheetVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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

          {/* Address Field - Now the source of truth for location */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Address</Text>
            <Pressable 
              style={styles.addressInput}
              onPress={() => setAddressSheetVisible(true)}
            >
              {address && (
                <Ionicons name="location" size={16} color="#6B7280" style={styles.addressIcon} />
              )}
              <Text style={[styles.addressInputText, !address && styles.placeholder]}>
                {address || "Enter address"}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#6B7280" />
            </Pressable>
          </View>


          {/* Gig Group Name Field */}
          <View style={styles.fieldContainer}>
            {/* <Text style={styles.fieldLabel}>Gig Group Name</Text>
            <View style={styles.groupNameContainer}>
              <TextInput
                style={[styles.textInput, styles.groupNameInput]}
                value={gigGroupName}
                onChangeText={setGigGroupName}
                placeholder="Enter group name"
                placeholderTextColor="#9CA3AF"
              />
              <Pressable 
                style={styles.infoIcon}
                onPress={() => console.log("Gig Group info clicked")}
                hitSlop={8}
              >
                <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
              </Pressable>
            </View> */}
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

        {/* Gig Hourly Amount Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gig Hourly Amount</Text>
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

        {/* Post Button */}
        <View style={styles.section}>
          <Pressable 
            style={[styles.postButton, (!isFormComplete() || isUploading) && styles.postButtonDisabled]}
            disabled={!isFormComplete() || isUploading}
            onPress={onSubmit}
          >
            <Text style={styles.postButtonText}>
              {isUploading ? 'Uploading...' : 'Preview Post'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Address Bottom Sheet - Now the only location picker */}
      <BottomSheetAddressPicker
        visible={addressSheetVisible}
        onClose={() => setAddressSheetVisible(false)}
        onSelectAddress={handleAddressSelect}
      />

      {/* Gig Hourly Amount Bottom Sheet */}
      <GigHourlySheet
        visible={hourlySheetVisible}
        onClose={() => setHourlySheetVisible(false)}
        onSelectAmount={handleHourlyAmountSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
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
  groupNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupNameInput: {
    flex: 1,
    marginRight: 8,
  },
  infoIcon: {
    padding: 4,
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
