import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface TimePickerProps {
  value?: string;
  onSelect: (time: string) => void;
  placeholder?: string;
}

interface TimeRange {
  from: string;
  to: string;
}

const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
const ampm = ['AM', 'PM'];

export default function TimePicker({ value, onSelect, placeholder = "Time" }: TimePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  
  // From time state
  const [fromHour, setFromHour] = useState<string>('4');
  const [fromMinute, setFromMinute] = useState<string>('30');
  const [fromAmPm, setFromAmPm] = useState<string>('PM');
  
  // To time state
  const [toHour, setToHour] = useState<string>('6');
  const [toMinute, setToMinute] = useState<string>('40');
  const [toAmPm, setToAmPm] = useState<string>('PM');

  const handleDone = () => {
    const fromTime = `${fromHour}:${fromMinute} ${fromAmPm}`;
    const toTime = `${toHour}:${toMinute} ${toAmPm}`;
    const timeRange = `${fromTime} - ${toTime}`;
    onSelect(timeRange);
    setModalVisible(false);
  };

  const handleClear = () => {
    setFromHour('4');
    setFromMinute('30');
    setFromAmPm('PM');
    setToHour('6');
    setToMinute('40');
    setToAmPm('PM');
    onSelect('');
  };

  return (
    <>
      <Pressable 
        style={styles.inputContainer} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.inputText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Ionicons name="time-outline" size={20} color="#6B7280" />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Pressable onPress={handleClear}>
                <Text style={styles.headerButton}>Clear</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Select Time Range</Text>
              <Pressable onPress={handleDone}>
                <Text style={styles.headerButton}>Done</Text>
              </Pressable>
            </View>

            {/* Time Picker */}
            <View style={styles.pickerContainer}>
              {/* From Time */}
              <View style={styles.timeColumn}>
                <Text style={styles.columnTitle}>From</Text>
                <View style={styles.pickerRow}>
                  {/* Hour Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {hours.map((hour) => (
                      <Pressable
                        key={hour}
                        style={[
                          styles.pickerItem,
                          fromHour === hour && styles.selectedItem
                        ]}
                        onPress={() => setFromHour(hour)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          fromHour === hour && styles.selectedItemText
                        ]}>
                          {hour}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Text style={styles.separator}>:</Text>

                  {/* Minute Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {minutes.map((minute) => (
                      <Pressable
                        key={minute}
                        style={[
                          styles.pickerItem,
                          fromMinute === minute && styles.selectedItem
                        ]}
                        onPress={() => setFromMinute(minute)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          fromMinute === minute && styles.selectedItemText
                        ]}>
                          {minute}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* AM/PM Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {ampm.map((period) => (
                      <Pressable
                        key={period}
                        style={[
                          styles.pickerItem,
                          fromAmPm === period && styles.selectedItem
                        ]}
                        onPress={() => setFromAmPm(period)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          fromAmPm === period && styles.selectedItemText
                        ]}>
                          {period}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* To Time */}
              <View style={styles.timeColumn}>
                <Text style={styles.columnTitle}>To</Text>
                <View style={styles.pickerRow}>
                  {/* Hour Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {hours.map((hour) => (
                      <Pressable
                        key={hour}
                        style={[
                          styles.pickerItem,
                          toHour === hour && styles.selectedItem
                        ]}
                        onPress={() => setToHour(hour)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          toHour === hour && styles.selectedItemText
                        ]}>
                          {hour}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  <Text style={styles.separator}>:</Text>

                  {/* Minute Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {minutes.map((minute) => (
                      <Pressable
                        key={minute}
                        style={[
                          styles.pickerItem,
                          toMinute === minute && styles.selectedItem
                        ]}
                        onPress={() => setToMinute(minute)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          toMinute === minute && styles.selectedItemText
                        ]}>
                          {minute}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* AM/PM Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {ampm.map((period) => (
                      <Pressable
                        key={period}
                        style={[
                          styles.pickerItem,
                          toAmPm === period && styles.selectedItem
                        ]}
                        onPress={() => setToAmPm(period)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          toAmPm === period && styles.selectedItemText
                        ]}>
                          {period}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  inputText: {
    fontSize: 16,
    color: '#111',
    flex: 1,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  pickerContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  timeColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
    marginBottom: 10,
  },
  pickerRow: {
    flexDirection: 'row',
    height: 200,
  },
  pickerColumn: {
    flex: 1,
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginHorizontal: 10,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 14,
    color: '#111',
  },
  selectedItemText: {
    fontWeight: '600',
  },
});
