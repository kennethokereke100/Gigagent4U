import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface PhotoUploadProps {
  onSelect: (uri: string) => void;
  placeholder?: string;
  value?: string;
}

export default function PhotoUpload({ 
  onSelect, 
  placeholder = "Upload photo",
  value
}: PhotoUploadProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access is required to upload photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const showUploadOptions = () => {
    Alert.alert(
      'Upload Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Photo Library',
          onPress: () => openPhotoLibrary(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log("Picked photo:", asset.uri);
        setSelectedPhoto(asset.uri);
        onSelect(asset.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openPhotoLibrary = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        console.log("Picked photo:", asset.uri);
        setSelectedPhoto(asset.uri);
        onSelect(asset.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  };

  const removePhoto = () => {
    setSelectedPhoto(null);
    onSelect('');
  };

  // Use either local state or prop value for preview
  const displayPhoto = selectedPhoto || value;
  
  if (displayPhoto) {
    return (
      <View style={styles.container}>
        <View style={styles.photoContainer}>
          <Image source={{ uri: displayPhoto }} style={styles.photoPreview} />
          <View style={styles.photoOverlay}>
            <View style={styles.photoTypeBadge}>
              <Ionicons name="image" size={16} color="#fff" />
              <Text style={styles.photoTypeText}>Photo</Text>
            </View>
            <Pressable style={styles.removeButton} onPress={removePhoto}>
              <Ionicons name="close-circle" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
        <Pressable style={styles.replaceButton} onPress={showUploadOptions}>
          <Text style={styles.replaceButtonText}>Replace photo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable style={styles.uploadButton} onPress={showUploadOptions}>
      <Ionicons name="cloud-upload-outline" size={32} color="#6B7280" />
      <Text style={styles.uploadButtonText}>{placeholder}</Text>
      <Text style={styles.uploadSubtext}>Tap to select from camera or library</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
  },
  photoContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    width: '100%',
    minWidth: 300,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 12,
  },
  photoTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  removeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
  },
  replaceButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  replaceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
});
