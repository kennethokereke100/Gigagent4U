import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AddEventBottomSheetProps {
  visible: boolean;
  onClose: () => void;
}

export default function AddEventBottomSheet({ visible, onClose }: AddEventBottomSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Handlers
  const handleCreateManually = () => {
    onClose();
    router.push('/screen/CreateEvent');
  };

  const handleGooglePlaces = () => {
    onClose();
    router.push('/screen/VenueSearch');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.container, { paddingBottom: insets.bottom + 20 }]} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Add an Event</Text>
            <View style={{ width: 30 }} />
          </View>

          {/* Buttons */}
          <View style={styles.buttonStack}>
            <Pressable style={styles.primaryButton} onPress={handleCreateManually}>
              <Text style={styles.primaryButtonText}>Create Manually</Text>
            </Pressable>

            <Pressable style={styles.googlePlacesButton} onPress={handleGooglePlaces}>
              <Text style={styles.googlePlacesButtonText}>Import Google Event</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%', // match BottomSheetAddressPicker
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  buttonStack: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  googlePlacesButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  googlePlacesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
