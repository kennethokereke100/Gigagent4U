import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PillarChip({ label, onPress }:{label:string; onPress?:()=>void}) {
  const C = onPress ? Pressable : View;
  return (
    <C onPress={onPress} style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </C>
  );
}

const styles = StyleSheet.create({
  chip:{
    alignSelf:'flex-start',
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:16,
    borderWidth:1,
    borderColor:'#111',
    backgroundColor:'#F2F2F2',
  },
  text:{ fontSize:12, fontWeight:'600', color:'#111' }
});
