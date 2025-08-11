import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type BottomPickerProps = {
  visible: boolean;
  title: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  onClose: () => void;
  onDone: () => void;
};

export default function BottomPicker({
  visible,
  title,
  options,
  selected,
  onChange,
  onClose,
  onDone,
}: BottomPickerProps) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    if (visible) {
      setSearchText('');
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const slideUp = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <Animated.View
          style={[
            styles.sheet,
            {
              transform: [{ translateY: slideUp }],
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color="#111" />
            </Pressable>
            <Text style={styles.headerTitle}>{title}</Text>
            <Pressable onPress={onDone} hitSlop={10}>
              <Text style={styles.doneButton}>Done</Text>
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
            <TextInput
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search categories..."
              placeholderTextColor="#9CA3AF"
              style={styles.searchInput}
              autoCapitalize="none"
            />
          </View>

          {/* Options */}
          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {filteredOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => toggleOption(option)}
                style={styles.optionRow}
              >
                <Text style={styles.optionText}>{option}</Text>
                {selected.includes(option) && (
                  <Ionicons name="checkmark-circle" size={24} color="#111" />
                )}
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  doneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#111',
  },
  optionsList: {
    maxHeight: 400,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  optionText: {
    fontSize: 16,
    color: '#111',
  },
});
