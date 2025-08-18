import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useRef } from 'react';
import { Button, View } from 'react-native';

export default function DebugSheet() {
  const ref = useRef<BottomSheetModal>(null);
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Button title="Open sheet" onPress={() => ref.current?.present()} />
      <BottomSheetModal ref={ref} snapPoints={['50%', '90%']}>
        <View style={{ flex: 1, padding: 24 }}>
          <Button title="Close" onPress={() => ref.current?.dismiss()} />
        </View>
      </BottomSheetModal>
    </View>
  );
}
