import { Slider } from '@miblanchard/react-native-slider';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type Props = {
  value: number;          // current miles
  onChange: (miles: number) => void;
  min?: number;           // default 0
  max?: number;           // default 100
  step?: number;          // e.g. 1 or 5 (optional)
  trackHeight?: number;   // default 6 (kept for signature, applied to track)
};

export default function DistanceSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  trackHeight = 6,
}: Props) {
  const handleChange = (v: number | number[]) => {
    const next = Array.isArray(v) ? v[0] : v;
    onChange(next);
  };

  return (
    <View style={styles.wrap} accessible accessibilityLabel="Distance slider">
      <Slider
        value={value}
        onValueChange={handleChange}
        minimumValue={min}
        maximumValue={max}
        step={step}
        animateTransitions
        minimumTrackTintColor="#111"      // filled
        maximumTrackTintColor="#E5E7EB"    // unfilled
        thumbTintColor="#FFFFFF"
        thumbStyle={styles.thumb}
        trackStyle={{ ...styles.track, height: trackHeight }}
        containerStyle={styles.container}
        thumbTouchSize={{ width: 44, height: 44 }} // large touch target
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', paddingVertical: 10 },
  container: { paddingHorizontal: 4 },
  track: { borderRadius: 999 },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#111',    // high-contrast border for accessibility
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
