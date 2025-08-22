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

interface DateRangePickerProps {
  startDate?: string;
  endDate?: string;
  onSelect: (startDate: string, endDate: string) => void;
  placeholder?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onSelect, 
  placeholder = "Select date range" 
}: DateRangePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStartMonth, setSelectedStartMonth] = useState<string>('');
  const [selectedStartYear, setSelectedStartYear] = useState<number>(currentYear);
  const [selectedEndMonth, setSelectedEndMonth] = useState<string>('');
  const [selectedEndYear, setSelectedEndYear] = useState<number>(currentYear);

  const handleDone = () => {
    if (selectedStartMonth && selectedStartYear && selectedEndMonth && selectedEndYear) {
      const startDateStr = `${selectedStartMonth} ${selectedStartYear}`;
      const endDateStr = `${selectedEndMonth} ${selectedEndYear}`;
      onSelect(startDateStr, endDateStr);
    }
    setModalVisible(false);
  };

  const handleClear = () => {
    setSelectedStartMonth('');
    setSelectedStartYear(currentYear);
    setSelectedEndMonth('');
    setSelectedEndYear(currentYear);
    onSelect('', '');
  };

  const isEndDateDisabled = (month: string, year: number) => {
    if (!selectedStartMonth || !selectedStartYear) return false;
    
    const startDate = new Date(`${selectedStartMonth} 1, ${selectedStartYear}`);
    const endDate = new Date(`${month} 1, ${year}`);
    
    return endDate <= startDate;
  };

  const displayValue = startDate && endDate ? `${startDate} - ${endDate}` : '';

  return (
    <>
      <Pressable 
        style={styles.inputContainer} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.inputText, !displayValue && styles.placeholder]}>
          {displayValue || placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#6B7280" />
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
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <Pressable onPress={handleDone}>
                <Text style={styles.headerButton}>Done</Text>
              </Pressable>
            </View>

            {/* Date Range Picker */}
            <View style={styles.pickerContainer}>
              {/* Start Date */}
              <View style={styles.dateColumn}>
                <Text style={styles.columnTitle}>Start Date</Text>
                <View style={styles.pickerRow}>
                  {/* Start Month Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {months.map((month) => (
                      <Pressable
                        key={month}
                        style={[
                          styles.pickerItem,
                          selectedStartMonth === month && styles.selectedItem
                        ]}
                        onPress={() => setSelectedStartMonth(month)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          selectedStartMonth === month && styles.selectedItemText
                        ]}>
                          {month}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* Start Year Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {years.map((year) => (
                      <Pressable
                        key={year}
                        style={[
                          styles.pickerItem,
                          selectedStartYear === year && styles.selectedItem
                        ]}
                        onPress={() => setSelectedStartYear(year)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          selectedStartYear === year && styles.selectedItemText
                        ]}>
                          {year}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* End Date */}
              <View style={styles.dateColumn}>
                <Text style={styles.columnTitle}>End Date</Text>
                <View style={styles.pickerRow}>
                  {/* End Month Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {months.map((month) => (
                      <Pressable
                        key={month}
                        style={[
                          styles.pickerItem,
                          selectedEndMonth === month && styles.selectedItem,
                          isEndDateDisabled(month, selectedEndYear) && styles.disabledItem
                        ]}
                        onPress={() => !isEndDateDisabled(month, selectedEndYear) && setSelectedEndMonth(month)}
                        disabled={isEndDateDisabled(month, selectedEndYear)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          selectedEndMonth === month && styles.selectedItemText,
                          isEndDateDisabled(month, selectedEndYear) && styles.disabledItemText
                        ]}>
                          {month}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>

                  {/* End Year Picker */}
                  <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                    {years.map((year) => (
                      <Pressable
                        key={year}
                        style={[
                          styles.pickerItem,
                          selectedEndYear === year && styles.selectedItem,
                          isEndDateDisabled(selectedEndMonth, year) && styles.disabledItem
                        ]}
                        onPress={() => !isEndDateDisabled(selectedEndMonth, year) && setSelectedEndYear(year)}
                        disabled={isEndDateDisabled(selectedEndMonth, year)}
                      >
                        <Text style={[
                          styles.pickerItemText,
                          selectedEndYear === year && styles.selectedItemText,
                          isEndDateDisabled(selectedEndMonth, year) && styles.disabledItemText
                        ]}>
                          {year}
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
  dateColumn: {
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
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#F3F4F6',
  },
  disabledItem: {
    opacity: 0.3,
  },
  pickerItemText: {
    fontSize: 14,
    color: '#111',
  },
  selectedItemText: {
    fontWeight: '600',
  },
  disabledItemText: {
    color: '#9CA3AF',
  },
});
