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

interface PhotoVideoUploadProps {
  onSelect: (uri: string, type: 'photo' | 'video') => void;
  placeholder?: string;
}

export default function PhotoVideoUpload({ 
  onSelect, 
  placeholder = "Upload photo or video" 
}: PhotoVideoUploadProps) {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video' | null>(null);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access is required to upload photos and videos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const showUploadOptions = () => {
    Alert.alert(
      'Upload Media',
      'Choose how you want to add media',
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
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const type = asset.type === 'video' ? 'video' : 'photo';
        setSelectedMedia(asset.uri);
        setMediaType(type);
        onSelect(asset.uri, type);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const openPhotoLibrary = async () => {
    if (!(await requestPermissions())) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const type = asset.type === 'video' ? 'video' : 'photo';
        setSelectedMedia(asset.uri);
        setMediaType(type);
        onSelect(asset.uri, type);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open photo library. Please try again.');
    }
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaType(null);
    onSelect('', 'photo');
  };

  if (selectedMedia) {
    return (
      <View style={styles.container}>
        <View style={styles.mediaContainer}>
          <Image source={{ uri: selectedMedia }} style={styles.mediaPreview} />
          <View style={styles.mediaOverlay}>
            <View style={styles.mediaTypeBadge}>
              <Ionicons 
                name={mediaType === 'video' ? 'videocam' : 'image'} 
                size={16} 
                color="#fff" 
              />
              <Text style={styles.mediaTypeText}>
                {mediaType === 'video' ? 'Video' : 'Photo'}
              </Text>
            </View>
            <Pressable style={styles.removeButton} onPress={removeMedia}>
              <Ionicons name="close-circle" size={24} color="#fff" />
            </Pressable>
          </View>
        </View>
        <Pressable style={styles.changeButton} onPress={showUploadOptions}>
          <Text style={styles.changeButtonText}>Change Media</Text>
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
  mediaContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  mediaPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  mediaOverlay: {
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
  mediaTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mediaTypeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  removeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
  },
  changeButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
});
