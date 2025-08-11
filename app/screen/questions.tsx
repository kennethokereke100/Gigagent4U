import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomPicker from '../../components/BottomPicker';
import BottomSheetQuestion from '../../components/BottomSheetQuestion';

const BG = '#F5F3F0';
const OTHER = 'Other';
const TALENT_CATEGORIES = ['UFC Athlete', 'Boxer', 'Wrestler', 'Comedian', 'Musician', 'Referee', 'Ring Announcer', 'Cutman', 'Coach', 'Other'];
const PROMOTER_CATEGORIES = ['Event Organizer', 'Matchmaker', 'Venue Owner', 'Talent Scout', 'Brand Partner', 'Media/Press', 'Sponsor Rep', 'Street Team', 'Other'];

function RadioButton({ selected, onPress, label }: { selected: boolean; onPress: () => void; label: string }) {
  return (
    <Pressable onPress={onPress} style={styles.radioRow}>
      <View style={styles.radioOuter}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

function CategoryChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  const chipBase = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 16,
  };

  const chipSelected = {
    backgroundColor: '#F2F2F2',
    borderColor: '#000',
  };

  return (
    <View style={[chipBase, chipSelected]}>
      <Text style={{ color: '#111111' }}>{label}</Text>
      <Pressable onPress={onRemove} hitSlop={8}>
        <Ionicons name="close" size={14} color="#6B7280" />
      </Pressable>
    </View>
  );
}

export default function QuestionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const isTall = height > 700;

  const [role, setRole] = useState<'Talent' | 'Promoter' | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');
  const [promoterType, setPromoterType] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [otherSheetOpen, setOtherSheetOpen] = useState(false);
  const [promoterSheetOpen, setPromoterSheetOpen] = useState(false);

  const q2Opacity = useRef(new Animated.Value(0)).current;
  const q2TranslateY = useRef(new Animated.Value(20)).current;
  const q3Opacity = useRef(new Animated.Value(0)).current;
  const q3TranslateY = useRef(new Animated.Value(20)).current;

  // Animate Q2 when role is selected
  useEffect(() => {
    if (role) {
      Animated.parallel([
        Animated.timing(q2Opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(q2TranslateY, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [role, q2Opacity, q2TranslateY]);

  // Animate Q3 when Other is selected
  useEffect(() => {
    if (categories.includes(OTHER)) {
      Animated.parallel([
        Animated.timing(q3Opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(q3TranslateY, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [categories, q3Opacity, q3TranslateY]);

  const canContinue = 
    !!role &&
    categories.length > 0;



  // CLEAR chips & text when role switches
  useEffect(() => {
    if (role) {
      setCategories([]);
      setOtherText('');
      setPromoterType('');
    }
  }, [role]);

  // Animate Q3 in/out based on 'Other' presence
  useEffect(() => {
    const isOther = categories.includes(OTHER);

    if (isOther) {
      Animated.parallel([
        Animated.timing(q3Opacity, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(q3TranslateY, { toValue: 0, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else {
      // hide & clear text so there is no gap or stale value
      Animated.parallel([
        Animated.timing(q3Opacity, { toValue: 0, duration: 120, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(q3TranslateY, { toValue: 12, duration: 120, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(() => setOtherText(''));
    }
  }, [categories, q3Opacity, q3TranslateY]);




  


  const removeCategory = (category: string) => {
    setCategories(categories.filter(c => c !== category));
  };

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
        <ScrollView
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              justifyContent: isTall ? 'center' : 'flex-start',
              paddingTop: isTall ? 0 : Platform.OS === 'android' ? 60 : 80,
              paddingBottom: insets.bottom + 24,
            },
          ]}
        >
          <View style={styles.form}>
            <Text style={styles.title}>Let&apos;s set up your profile</Text>

            {/* Question 1 */}
            <View style={styles.questionGroup}>
              <Text style={styles.questionLabel}>Which role fits you best?</Text>
              <View style={styles.radioGroup}>
                <RadioButton
                  selected={role === 'Talent'}
                  onPress={() => setRole('Talent')}
                  label="Talent"
                />
                <RadioButton
                  selected={role === 'Promoter'}
                  onPress={() => setRole('Promoter')}
                  label="Promoter"
                />
              </View>
            </View>

            {/* Question 2 */}
            <Animated.View
              style={[
                styles.questionGroup,
                {
                  opacity: q2Opacity,
                  transform: [{ translateY: q2TranslateY }],
                },
              ]}
            >
              <Text style={styles.questionLabel}>Select your Category</Text>
              
              {categories.length === 0 ? (
                <Pressable onPress={() => {
                  setPickerOpen(true);
                }} style={styles.addChip}>
                  <Text style={styles.addChipText}>+ Add category</Text>
                </Pressable>
              ) : (
                <View style={styles.chipContainer}>
                  {categories.map((category) => (
                    <CategoryChip
                      key={category}
                      label={category}
                      onRemove={() => removeCategory(category)}
                    />
                  ))}
                  <Pressable onPress={() => {
                    setPickerOpen(true);
                  }} style={styles.addChip}>
                    <Text style={styles.addChipText}>+ Add category</Text>
                  </Pressable>
                </View>
              )}
            </Animated.View>

            {/* Q3a — only render when pickedOther */}
            {categories.includes(OTHER) && (
              <View style={[styles.questionGroup, { marginTop: 12 }]}>
                <Text style={styles.questionLabel}>Tell us your category (optional)</Text>
                <Text style={styles.helperText}>You selected Other. What would you call your category?</Text>

                <Pressable
                  onPress={() => {
                    setOtherSheetOpen(true);
                  }}
                  style={({ pressed }) => [
                    styles.fakeInput,
                    pressed && { opacity: 0.7 }
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.fakeInputText, !otherText && styles.placeholder]}>
                    {otherText || 'Type your category'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>
              </View>
            )}

            {/* Q3b — Promoter only */}
            {role === 'Promoter' && (
              <View style={[styles.questionGroup, { marginTop: 8 }]}>
                <Text style={styles.qLabel}>What type of promoter are you? (optional)</Text>

                <Pressable
                  onPress={() => {
                    setPromoterSheetOpen(true);
                  }}
                  style={({ pressed }) => [
                    styles.fakeInput,
                    pressed && { opacity: 0.7 }
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={[styles.fakeInputText, !promoterType && styles.placeholder]}>
                    {promoterType || 'Describe your role  e.g., venue owner, festival organizer'}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </Pressable>
              </View>
            )}

            <Pressable
              disabled={!canContinue}
              onPress={() => router.push('/screen/locationsearch')}
              style={({ pressed }) => [
                styles.cta,
                !canContinue && styles.ctaDisabled,
                pressed && canContinue && styles.ctaPressed,
              ]}
            >
              <Text style={styles.ctaText}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>

        <BottomPicker
          visible={pickerOpen}
          title="Category"
          options={role === 'Promoter' ? PROMOTER_CATEGORIES : TALENT_CATEGORIES}
          selected={categories}
          onChange={setCategories}
          onClose={() => setPickerOpen(false)}
          onDone={() => setPickerOpen(false)}
        />

        <BottomSheetQuestion
          visible={otherSheetOpen}
          title="Tell us your category"
          initialValue={otherText}
          placeholder="Type your category"
          onDone={(v) => setOtherText(v)}
          onClose={() => setOtherSheetOpen(false)}
        />
        <BottomSheetQuestion
          visible={promoterSheetOpen}
          title="What type of promoter are you?"
          initialValue={promoterType}
          placeholder="Describe your role (e.g., venue owner, festival organizer)"
          onDone={(v) => setPromoterType(v)}
          onClose={() => setPromoterSheetOpen(false)}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, paddingHorizontal: 20 },
  form: { rowGap: 28 },
  title: { fontSize: 28, fontWeight: '700', color: '#111' },

  questionGroup: { rowGap: 16 },
  questionLabel: { fontSize: 16, fontWeight: '600', color: '#111' },
  helperText: { fontSize: 14, color: '#6B7280', lineHeight: 20 },

  radioGroup: { rowGap: 12 },
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DADADA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#111',
  },
  radioLabel: { fontSize: 16, color: '#111' },

  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EEF2F5',
    borderRadius: 18,
  },
  chipText: { fontSize: 14, color: '#111' },
  addChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DADADA',
    borderStyle: 'dashed',
    borderRadius: 18,
  },
  addChipText: { fontSize: 14, color: '#6B7280' },

  textArea: {
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111',
  },

  cta: {
    height: 56,
    borderRadius: 28,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  ctaDisabled: { backgroundColor: '#BDBDBD' },
  ctaPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  ctaText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  fakeInput: {
    minHeight: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DADADA',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Ensure touch events work
    elevation: 0,
    shadowOpacity: 0,
  },
  fakeInputText: { fontSize: 16, color: '#111', flex: 1, paddingRight: 8 },
  placeholder: { color: '#9CA3AF' },
  
  q3Container: {
    paddingVertical: 16,
    paddingHorizontal: 0,
  },
  qLabel: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#111',
    marginBottom: 8,
  },
  qValue: { 
    fontSize: 16, 
    color: '#9CA3AF',
    lineHeight: 22,
  },
});
