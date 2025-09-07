import { useRouter } from 'expo-router';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import ErrorOverlay from '../../components/ErrorOverlay';
import { auth } from '../../firebaseConfig';
import { getFriendlyErrorMessage } from '../../firebaseErrorMessages';

const BG = '#F5F3F0';
const CTA_SPACING = 12;
const FORM_SHIFT = 70;

function FloatingInput({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
}) {
  const [focused, setFocused] = useState(false);
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
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        placeholder="" // label handles placeholder
        style={styles.textInput}
        returnKeyType="done"
      />
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isTall = height > 700;

  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [exists, setExists] = useState(false);

  const isValidEmail = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()),
    [email]
  );

  const checkEmail = async () => {
    if (!isValidEmail) return;
    setChecking(true);
    setErrors([]);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email.trim());
      if (methods.length === 0) {
        setExists(false);
        const msg = getFriendlyErrorMessage("auth/user-not-found");
        setErrors([msg]);
      } else {
        setExists(true);
      }
    } catch (err: any) {
      console.error('Error checking email:', err.message);
      const msg = getFriendlyErrorMessage(err.code);
      setErrors([msg]);
    } finally {
      setChecking(false);
    }
  };

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
            <Text style={styles.title}>Sign in or sign up</Text>

            <FloatingInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter Email Address"
              keyboardType="email-address"
            />

            <Pressable onPress={() => router.push('/screen/Register')} style={styles.signupLink}>
              <Text style={styles.signupText}>New User? Please sign up</Text>
            </Pressable>

            {/* ErrorOverlay shows above title */}
            <ErrorOverlay
              messages={errors}
              onHide={() => setErrors([])}
            />
          </Animated.View>
        </ScrollView>

        <Animated.View pointerEvents="box-none" style={[styles.ctaWrap, { paddingBottom: bottomOffset }]}>
          <Pressable
            disabled={!isValidEmail || checking}
            onPress={() => {
              if (exists) {
                router.push({ pathname: '/screen/Password', params: { email } });
              }
            }}
            onPressIn={checkEmail}
            style={({ pressed }) => [
              styles.cta,
              !isValidEmail && styles.ctaDisabled,
              pressed && isValidEmail && styles.ctaPressed,
            ]}
          >
            <Text style={styles.ctaText}>{checking ? 'Checking...' : 'Next'}</Text>
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

  signupLink: { marginTop: 8, alignItems: 'center' },
  signupText: { color: '#111', fontSize: 14, textDecorationLine: 'underline' },

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
