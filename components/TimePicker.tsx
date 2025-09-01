import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // From time state - default to 1:00 AM
  const [fromHour, setFromHour] = useState<string>('1');
  const [fromMinute, setFromMinute] = useState<string>('00');
  const [fromAmPm, setFromAmPm] = useState<string>('AM');
  
  // To time state - default to 1:00 PM
  const [toHour, setToHour] = useState<string>('1');
  const [toMinute, setToMinute] = useState<string>('00');
  const [toAmPm, setToAmPm] = useState<string>('PM');

  // Initialize with default values on first render
  useEffect(() => {
    if (!isInitialized) {
      // Set default values: 1:00 AM to 1:00 PM
      setFromHour('1');
      setFromMinute('00');
      setFromAmPm('AM');
      setToHour('1');
      setToMinute('00');
      setToAmPm('PM');
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Parse existing value when component mounts or value changes
  useEffect(() => {
    if (value && !hasBeenOpened) {
      // Parse existing time range like "1:00 PM - 2:00 PM"
      const timeRange = value.split(' - ');
      if (timeRange.length === 2) {
        const fromTime = timeRange[0].trim();
        const toTime = timeRange[1].trim();
        
        // Parse from time
        const fromMatch = fromTime.match(/(\d+):(\d{2})\s*(AM|PM)/);
        if (fromMatch) {
          setFromHour(fromMatch[1]);
          setFromMinute(fromMatch[2]);
          setFromAmPm(fromMatch[3]);
        }
        
        // Parse to time
        const toMatch = toTime.match(/(\d+):(\d{2})\s*(AM|PM)/);
        if (toMatch) {
          setToHour(toMatch[1]);
          setToMinute(toMatch[2]);
          setToAmPm(toMatch[3]);
        }
      }
    }
  }, [value, hasBeenOpened]);

  // Helper function to convert time to minutes for comparison
  const timeToMinutes = (hour: string, minute: string, ampm: string): number => {
    let h = parseInt(hour);
    const m = parseInt(minute);
    
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    
    return h * 60 + m;
  };

  // Helper function to validate time selection
  const validateTimeSelection = (newHour: string, newMinute: string, newAmPm: string, isFromTime: boolean): boolean => {
    const newTimeMinutes = timeToMinutes(newHour, newMinute, newAmPm);
    
    if (isFromTime) {
      // For from time, check if it's before current to time
      const toTimeMinutes = timeToMinutes(toHour, toMinute, toAmPm);
      if (newTimeMinutes >= toTimeMinutes) {
        Alert.alert('Invalid Time', 'Start time must be earlier than end time.');
        return false;
      }
    } else {
      // For to time, check if it's after current from time
      const fromTimeMinutes = timeToMinutes(fromHour, fromMinute, fromAmPm);
      if (newTimeMinutes <= fromTimeMinutes) {
        Alert.alert('Invalid Time', 'End time must be later than start time.');
        return false;
      }
    }
    
    return true;
  };

  const handleDone = () => {
    const fromTime = `${fromHour}:${fromMinute} ${fromAmPm}`;
    const toTime = `${toHour}:${toMinute} ${toAmPm}`;
    const timeRange = `${fromTime} - ${toTime}`;
    onSelect(timeRange);
    setModalVisible(false);
  };

  const handleClear = () => {
    // Reset to default values: 1:00 AM to 1:00 PM
    setFromHour('1');
    setFromMinute('00');
    setFromAmPm('AM');
    setToHour('1');
    setToMinute('00');
    setToAmPm('PM');
    setHasBeenOpened(false);
    onSelect('');
  };

  return (
    <>
      <Pressable 
        style={styles.inputContainer} 
        onPress={() => {
          setModalVisible(true);
          setHasBeenOpened(true);
        }}
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
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <Pressable 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
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
                        key={`from-hour-${hour}`}
                        style={[
                          styles.pickerItem,
                          fromHour === hour && styles.selectedItem
                        ]}
                        onPress={() => {
                          if (validateTimeSelection(hour, fromMinute, fromAmPm, true)) {
                            setFromHour(hour);
                          }
                        }}
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
                        key={`from-minute-${minute}`}
                        style={[
                          styles.pickerItem,
                          fromMinute === minute && styles.selectedItem
                        ]}
                        onPress={() => {
                          if (validateTimeSelection(fromHour, minute, fromAmPm, true)) {
                            setFromMinute(minute);
                          }
                        }}
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
                        key={`from-period-${period}`}
                        style={[
                          styles.pickerItem,
                          fromAmPm === period && styles.selectedItem
                        ]}
                        onPress={() => {
                          if (validateTimeSelection(fromHour, fromMinute, period, true)) {
                            setFromAmPm(period);
                          }
                        }}
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
                        key={`to-hour-${hour}`}
                        style={[
                          styles.pickerItem,
                          toHour === hour && styles.selectedItem
                        ]}
                        onPress={() => {
                          if (validateTimeSelection(hour, toMinute, toAmPm, false)) {
                            setToHour(hour);
                          }
                        }}
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
                        key={`to-minute-${minute}`}
                        style={[
                          styles.pickerItem,
                          toMinute === minute && styles.selectedItem
                        ]}
                        onPress={() => {
                          if (validateTimeSelection(toHour, minute, toAmPm, false)) {
                            setToMinute(minute);
                          }
                        }}
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
                        key={`to-period-${period}`}
                        style={[
                          styles.pickerItem,
                          toAmPm === period && styles.selectedItem
                        ]}
                        onPress={() => {
                          if (validateTimeSelection(toHour, toMinute, period, false)) {
                            setToAmPm(period);
                          }
                        }}
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
          </Pressable>
        </Pressable>
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
