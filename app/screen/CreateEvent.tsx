import { useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { View } from 'react-native';
import { useUserLocation } from '../../contexts/UserLocationContext';
import CreateEventForm from '../components/CreateEventForm';

export default function CreateEvent() {
  const router = useRouter();
  const { city, state } = useUserLocation();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [gigGroupName, setGigGroupName] = useState('');
  const [hourlyAmount, setHourlyAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  
  // Bottom sheet states
  const [addressSheetVisible, setAddressSheetVisible] = useState(false);
  const [hourlySheetVisible, setHourlySheetVisible] = useState(false);

  const handlePost = () => {
    if (!title.trim()) return; // Title is required
    
    // Create location string from context
    const locationString = city && state ? `${city}, ${state}` : city || '';
    
    const eventData = {
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      contactInfo: contactInfo.trim(),
      gigGroupName: gigGroupName.trim(),
      hourlyAmount: hourlyAmount.trim(),
      startDate,
      endDate,
      time,
      location: locationString,
      photoUri,
      mediaType: 'photo',
      postedAt: new Date().toISOString(),
      pillar: 'Event', // Default category
      priceFrom: hourlyAmount || '$0', // Use hourly amount if set
      venue: locationString,
      distanceMi: 0, // Will be calculated based on user location
      startsAt: new Date().toISOString(), // Will be calculated from date/time
      endsAt: new Date().toISOString(), // Will be calculated from date/time
    };
    
    // Navigate to preview with all event data
    router.push({
      pathname: '/screen/previewpost',
      params: eventData
    });
  };

  const isFormComplete = () => {
    return (
      title.trim() !== '' &&
      description.trim() !== '' &&
      address.trim() !== '' &&
      contactInfo.trim() !== '' &&
      gigGroupName.trim() !== '' &&
      hourlyAmount.trim() !== '' &&
      startDate !== '' &&
      endDate !== '' &&
      time !== '' &&
      photoUri !== ''
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <CreateEventForm
        // Form values
        title={title}
        description={description}
        address={address}
        contactInfo={contactInfo}
        gigGroupName={gigGroupName}
        hourlyAmount={hourlyAmount}
        startDate={startDate}
        endDate={endDate}
        time={time}
        photoUri={photoUri}
        
        // State setters
        setTitle={setTitle}
        setDescription={setDescription}
        setAddress={setAddress}
        setContactInfo={setContactInfo}
        setGigGroupName={setGigGroupName}
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
        onSubmit={handlePost}
      />
    </View>
  );
}
