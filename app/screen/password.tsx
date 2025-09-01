import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Keyboard,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';
const CTA_SPACING = 12;
const FORM_SHIFT = 70;

function FloatingInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  isPassword,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  isPassword?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const labelTop = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [22, 6] });
  const labelSize = labelAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
  const labelColor = '#6B7280';

  const isSecure = isPassword && !show;

  return (
    <View style={styles.inputWrap}>
      <Animated.Text style={[styles.floatingLabel, { top: labelTop, fontSize: labelSize, color: labelColor }]}>
        {placeholder}
      </Animated.Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        secureTextEntry={isSecure}
        autoCorrect={false}
        textContentType={isPassword ? 'password' : 'oneTimeCode'}
        autoCapitalize="none"
        placeholder="" // label handles placeholder
        style={[styles.textInput, isPassword && { paddingRight: 44 }]}
        returnKeyType="done"
      />
      {isPassword && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={show ? 'Hide password' : 'Show password'}
          onPress={() => setShow((s) => !s)}
          hitSlop={10}
          style={styles.eyeButton}
        >
          <Ionicons name={show ? 'eye' : 'eye-off'} size={20} color="#111" />
        </Pressable>
      )}
    </View>
  );
}

export default function PasswordScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isTall = height > 700;

  const [password, setPassword] = useState('');

  const bottomOffset = useRef(new Animated.Value(insets.bottom + CTA_SPACING)).current;
  const formTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e: any) => {
      const kbHeight = e?.endCoordinates?.height ?? 0;
      const duration = Platform.OS === 'ios' ? e?.duration ?? 250 : 220;

      Animated.timing(bottomOffset, {
        toValue: kbHeight + insets.bottom + CTA_SPACING,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      Animated.timing(formTranslateY, {
        toValue: -FORM_SHIFT,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const onHide = (e: any) => {
      const duration = Platform.OS === 'ios' ? e?.duration ?? 200 : 180;

      Animated.timing(bottomOffset, {
        toValue: insets.bottom + CTA_SPACING,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      Animated.timing(formTranslateY, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };

    const s = Keyboard.addListener(showEvt, onShow);
    const h = Keyboard.addListener(hideEvt, onHide);
    return () => { s.remove(); h.remove(); };
  }, [bottomOffset, formTranslateY, insets.bottom]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              justifyContent: isTall ? 'center' : 'flex-start',
              paddingTop: isTall ? 0 : Platform.OS === 'android' ? 60 : 80,
              paddingBottom: (insets.bottom || 0) + CTA_SPACING + 72,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.form, { transform: [{ translateY: formTranslateY }] }]}>
            <Text style={styles.title}>Enter your password</Text>

            <FloatingInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter Password"
              secureTextEntry
              isPassword
            />
          </Animated.View>
        </ScrollView>

        <Animated.View pointerEvents="box-none" style={[styles.ctaWrap, { paddingBottom: bottomOffset }]}>
          <Pressable
            disabled={password.length === 0}
            onPress={() => router.replace('/screen/Register')}
            style={({ pressed }) => [
              styles.cta,
              password.length === 0 && styles.ctaDisabled,
              pressed && password.length > 0 && styles.ctaPressed,
            ]}
          >
            <Text style={styles.ctaText}>Next</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20 },
  form: { rowGap: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },

  inputWrap: {
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  floatingLabel: {
    position: 'absolute',
    left: 14,
  },
  textInput: {
    fontSize: 16,
    color: '#111',
    paddingTop: 22, // room for floating label
    paddingBottom: 12,
  },
  eyeButton: {
    position: 'absolute',
    right: 10,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    top: 10, // adjust for vertical centering if needed
  },

  ctaWrap: { position: 'absolute', left: 16, right: 16, bottom: 0 },
  cta: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabled: { backgroundColor: '#BDBDBD' },
  ctaPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
