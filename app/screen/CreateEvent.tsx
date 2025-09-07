import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomPicker from '../../components/BottomPicker';
import { useUserLocation } from '../../contexts/UserLocationContext';
import CreateEventForm from '../components/CreateEventForm';

const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/gigplaceholder/800/450';

const TALENT_CATEGORIES = ['UFC Athlete', 'Boxer', 'Wrestler', 'Comedian', 'Musician', 'Referee', 'Ring Announcer', 'Cutman', 'Coach', 'Other'];

export default function CreateEvent() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { city, state } = useUserLocation();
  
  // Form state
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  // const [gigGroupName, setGigGroupName] = useState('');
  const [hourlyAmount, setHourlyAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Bottom sheet states
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);
  const [hourlySheetVisible, setHourlySheetVisible] = useState(false);

  // Hydrate form with params if they exist (for editing)
  useEffect(() => {
    if (params.category) setCategory(String(params.category));
    if (params.customCategory) setCustomCategory(String(params.customCategory));
    if (params.title) setTitle(String(params.title));
    if (params.description) setDescription(String(params.description));
    if (params.address) setAddress(String(params.address));
    // if (params.gigGroupName) setGigGroupName(String(params.gigGroupName));
    if (params.hourlyAmount) setHourlyAmount(String(params.hourlyAmount));
    if (params.startDate) setStartDate(String(params.startDate));
    if (params.endDate) setEndDate(String(params.endDate));
    if (params.time) setTime(String(params.time));
    if (params.photoUri) setPhotoUri(String(params.photoUri));
    if (params.coverImage) setCoverImage(String(params.coverImage));
  }, [params]);

  const handleCategorySelect = (selectedCategories: string[]) => {
    if (selectedCategories.length > 0) {
      const selected = selectedCategories[0]; // Only allow single selection
      setCategory(selected);
      if (selected !== 'Other') {
        setCustomCategory(''); // Clear custom category if not "Other"
      }
      setCategoryPickerOpen(false);
    }
  };

  const getDisplayCategory = () => {
    if (category === 'Other' && customCategory.trim()) {
      return customCategory.trim();
    }
    return category;
  };

  const handlePreviewPost = async () => {
    if (!category.trim()) return; // Category is required
    if (category === 'Other' && !customCategory.trim()) return; // Custom category text required if "Other" selected
    if (!title.trim()) return; // Title is required
    
    // Force placeholder for now - no upload logic
    const placeholderImage = PLACEHOLDER_IMAGE;
    
    // Create location string from context
    const locationString = city && state ? `${city}, ${state}` : city || '';
    
    // Create the event object with all required fields
    const eventData = {
      category: getDisplayCategory(),
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
              // gigGroupName: gigGroupName.trim(),
      hourlyAmount: hourlyAmount.trim(),
      startDate: startDate,
      endDate: endDate,
      time: time,
      photoUri: placeholderImage,
      coverImage: placeholderImage,
      location: locationString,
    };

    // Navigate to preview post with event data
    router.push({
      pathname: '/screen/previewpost',
      params: eventData
    });
  };

  const isFormComplete = () => {
    const categoryValid = category.trim() !== '' && (category !== 'Other' || customCategory.trim() !== '');
    return (
      categoryValid &&
      title.trim() !== '' &&
      description.trim() !== '' &&
      address.trim() !== '' &&
      // gigGroupName.trim() !== '' &&
      hourlyAmount.trim() !== '' &&
      startDate !== '' &&
      endDate !== '' &&
      time !== ''
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header with X button */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB'
      }}>
        <Pressable 
          onPress={() => router.back()}
          style={{ 
            padding: 8,
            borderRadius: 20,
            backgroundColor: '#F3F4F6'
          }}
        >
          <Ionicons name="close" size={24} color="#374151" />
        </Pressable>
        <Text style={{ 
          marginLeft: 16, 
          fontSize: 18, 
          fontWeight: '600', 
          color: '#111827' 
        }}>
          Create Event
        </Text>
      </View>

      {/* Category Selection - First Required Field */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text style={{ 
          fontSize: 16, 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: 12 
        }}>
          Select an entertainer to hire
        </Text>
        
        {/* Category Picker */}
        <Pressable 
          onPress={() => setCategoryPickerOpen(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: category ? '#10B981' : '#D1D5DB',
            borderRadius: 12,
            backgroundColor: category ? '#F0FDF4' : '#FFFFFF'
          }}
        >
          <Text style={{ 
            color: category ? '#065F46' : '#6B7280',
            fontSize: 16,
            fontWeight: category ? '600' : '400'
          }}>
            {category ? getDisplayCategory() : 'Select your category'}
          </Text>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={category ? '#065F46' : '#6B7280'} 
          />
        </Pressable>

        {/* Custom Category Input */}
        {category === 'Other' && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ 
              fontSize: 14, 
              fontWeight: '500', 
              color: '#374151', 
              marginBottom: 8 
            }}>
              Specify your category
            </Text>
            <TextInput
              value={customCategory}
              onChangeText={setCustomCategory}
              placeholder="Enter custom category..."
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: customCategory.trim() ? '#10B981' : '#D1D5DB',
                borderRadius: 12,
                backgroundColor: '#FFFFFF',
                fontSize: 16
              }}
            />
          </View>
        )}
      </View>

      <CreateEventForm
        // Form values
        title={title}
        description={description}
        address={address}
        // gigGroupName={gigGroupName}
        hourlyAmount={hourlyAmount}
        startDate={startDate}
        endDate={endDate}
        time={time}
        photoUri={photoUri}
        coverImage={coverImage}
        isUploading={isUploading}
        
        // State setters
        setTitle={setTitle}
        setDescription={setDescription}
        setAddress={setAddress}
        // setGigGroupName={setGigGroupName}
        setHourlyAmount={setHourlyAmount}
        setStartDate={setStartDate}
        setEndDate={setEndDate}
        setTime={setTime}
        setPhotoUri={setPhotoUri}
        
        // Bottom sheet states
        addressSheetVisible={addressSheetVisible}
        hourlySheetVisible={hourlySheetVisible}
        setAddressSheetVisible={setAddressSheetVisible}
        setHourlySheetVisible={setHourlySheetVisible}
        
        // Form validation
        isFormComplete={isFormComplete}
        
        // Submit handler
        onSubmit={handlePreviewPost}
      />

      {/* Category Picker Bottom Sheet */}
      <BottomPicker
        visible={categoryPickerOpen}
        title="Select Category"
        options={TALENT_CATEGORIES}
        selected={category ? [category] : []}
        onChange={handleCategorySelect}
        onClose={() => setCategoryPickerOpen(false)}
        onDone={() => setCategoryPickerOpen(false)}
      />
    </SafeAreaView>
  );
}
