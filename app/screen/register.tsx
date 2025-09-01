import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Easing,
  Keyboard,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F5F3F0';
const CTA_SPACING = 12;
const FORM_SHIFT = 70;

function FloatingInput(props: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  isPassword?: boolean;
}) {
  const { value, onChangeText, placeholder, secureTextEntry, keyboardType, isPassword } = props;
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

  const isSecure = isPassword && !show;

  return (
    <View style={styles.inputWrap}>
      <Animated.Text style={[styles.floatingLabel, { top: labelTop, fontSize: labelSize, color: '#6B7280' }]}>
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
        keyboardType={keyboardType}
        autoCapitalize="none"
        placeholder=""
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

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isTall = height > 700;

  const [email, setEmail] = useState('');
  const [email2, setEmail2] = useState('');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [pw, setPw] = useState('');

  const pwLen = pw.length;

  // Strength meta (only when not empty)
  const strength = useMemo(() => {
    if (pwLen === 0) return null;
    if (pwLen <= 6) return { label: 'Too weak', color: '#EF4444', pct: 0.25, helper: 'Password must be at least 7 characters.' };
    if (pwLen <= 8) return { label: 'It\'s okay', color: '#F59E0B', pct: 0.6, helper: 'Add a few more characters for a stronger password.' };
    return { label: 'Very strong', color: '#10B981', pct: 1, helper: 'Password is strong.' };
  }, [pwLen]);

  const bottomOffset = useRef(new Animated.Value(insets.bottom + CTA_SPACING)).current;
  const barAnim = useRef(new Animated.Value(strength?.pct ?? 0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: strength?.pct ?? 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [strength?.pct]);

  const barWidth = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const allFilled = email && email2 && first && last && pw;
  const emailsMatch = email.trim() === email2.trim();
  const canSubmit = allFilled && emailsMatch && pwLen > 6;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              justifyContent: isTall ? 'center' : 'flex-start',
              paddingTop: isTall ? 0 : Platform.OS === 'android' ? 60 : 80,
              paddingBottom: (insets.bottom || 0) + CTA_SPACING + 96,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            <Text style={styles.title}>Create an account</Text>

            <FloatingInput placeholder="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <FloatingInput placeholder="Confirm email address" value={email2} onChangeText={setEmail2} keyboardType="email-address" />
            <FloatingInput placeholder="First name" value={first} onChangeText={setFirst} />
            <FloatingInput placeholder="Last name" value={last} onChangeText={setLast} />
            <FloatingInput placeholder="Password" value={pw} onChangeText={setPw} secureTextEntry isPassword />

            {/* Strength only when typing */}
            {pwLen > 0 && (
              <>
               <Text style={[styles.helper, { color: strength?.color }]}>{strength?.helper}</Text>
                <View style={styles.strengthRow}>
                  <Text style={[styles.strengthLabel, { color: strength?.color }]}>{'Password strength'}</Text>
                  <Text style={[styles.strengthValue, { color: strength?.color }]}>{strength?.label}</Text>
                </View>
                <View style={styles.track}>
                  <Animated.View style={[styles.fill, { backgroundColor: strength?.color, width: barWidth }]} />
                </View>
               
              </>
            )}

            <Text style={styles.legal}>
              By signing up or signing in, I accept the <Text style={styles.link}>Gigagent4U Terms of Service</Text> and have read the <Text style={styles.link}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>

        <Animated.View pointerEvents="box-none" style={[styles.ctaWrap, { paddingBottom: bottomOffset }]}>
          <Pressable
            disabled={!canSubmit}
            onPress={() => router.push('/screen/Questions')}
            style={({ pressed }) => [
              styles.cta,
              !canSubmit && styles.ctaDisabled,
              pressed && canSubmit && styles.ctaPressed,
            ]}
          >
            <Text style={styles.ctaText}>Sign Up</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scrollContent: { flexGrow: 1, paddingHorizontal: 20 },
  form: { rowGap: 14 },
  title: { fontSize: 28, fontWeight: '700', color: '#111', marginBottom: 6 },

  inputWrap: {
    height: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  floatingLabel: { position: 'absolute', left: 14 },
  textInput: { fontSize: 16, color: '#111', paddingTop: 22, paddingBottom: 12 },
  eyeButton: {
    position: 'absolute',
    right: 10,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    top: 10, // adjust for vertical centering if needed
  },

  strengthRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  strengthLabel: { fontSize: 13, fontWeight: '600' },
  strengthValue: { fontSize: 13, fontWeight: '700' },
  track: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 3 },
  helper: { fontSize: 12, marginTop: 6 },

  legal: { fontSize: 12, color: '#4B5563', lineHeight: 18, marginTop: 12 },
  link: { color: '#111', textDecorationLine: 'underline' },

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
