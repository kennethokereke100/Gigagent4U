import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useRef } from 'react';
import { Button, Text, View } from 'react-native';

const TestBottomSheet = () => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const handlePresentPress = () => {
    console.log('Test: handlePresentPress called');
    console.log('Test: bottomSheetRef.current:', bottomSheetRef.current);
    bottomSheetRef.current?.present();
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Test Bottom Sheet" onPress={handlePresentPress} />
      
      <BottomSheetModal
        ref={bottomSheetRef}
        snapPoints={['25%', '50%']}
        enablePanDownToClose
      >
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text>Test Bottom Sheet Content</Text>
        </View>
      </BottomSheetModal>
    </View>
  );
};

export default TestBottomSheet;
