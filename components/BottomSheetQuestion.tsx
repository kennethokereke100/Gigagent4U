import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Keyboard,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad' | 'email-address';
  onDone: (value: string) => void;
  onClose: () => void;
};

export default function BottomSheetQuestion({
  visible,
  title,
  initialValue = '',
  placeholder = 'Type here…',
  keyboardType = 'default',
  onDone,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const [text, setText] = useState(initialValue);

  const slide = useRef(new Animated.Value(0)).current;   // 0 hidden → 1 shown
  const fade  = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => setText(initialValue), [initialValue]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slide, { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade,  { toValue: 1, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start(() => setTimeout(() => inputRef.current?.focus(), 50));
    } else {
      Animated.parallel([
        Animated.timing(slide, { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fade,  { toValue: 0, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slide, fade]);

  const translateY = slide.interpolate({ inputRange: [0, 1], outputRange: [500, 0] });

  const handleDone = () => {
    onDone(text.trim());
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fade }]}>
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY }] }]}
        >
          {/* Header */}
          <View style={[styles.header, { paddingTop: insets.top + 14 }]}>
            <Pressable hitSlop={12} onPress={onClose}>
              <Ionicons name="close" size={22} color="#111" />
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            <Pressable hitSlop={12} onPress={handleDone}>
              <Text style={styles.done}>Done</Text>
            </Pressable>
          </View>

          {/* Large textarea */}
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="#9CA3AF"
            multiline={keyboardType === 'default'}
            textAlignVertical="top"
            style={styles.textarea}
            returnKeyType="done"
            onSubmitEditing={handleDone}
            keyboardType={keyboardType}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: '#fff' },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingTop: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#111' },
  done: { fontSize: 16, fontWeight: '600', color: '#111' },
  textarea: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
  },
});
