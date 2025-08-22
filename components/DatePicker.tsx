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

interface DatePickerProps {
  value?: string;
  onSelect: (date: string) => void;
  placeholder?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

export default function DatePicker({ value, onSelect, placeholder = "Date" }: DatePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const handleDone = () => {
    if (selectedMonth && selectedYear) {
      onSelect(`${selectedMonth} ${selectedYear}`);
    }
    setModalVisible(false);
  };

  const handleClear = () => {
    setSelectedMonth('');
    setSelectedYear(currentYear);
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
              <Pressable onPress={handleDone}>
                <Text style={styles.headerButton}>Done</Text>
              </Pressable>
            </View>

            {/* Date Picker */}
            <View style={styles.pickerContainer}>
              {/* Month Picker */}
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {months.map((month) => (
                  <Pressable
                    key={month}
                    style={[
                      styles.pickerItem,
                      selectedMonth === month && styles.selectedItem
                    ]}
                    onPress={() => setSelectedMonth(month)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedMonth === month && styles.selectedItemText
                    ]}>
                      {month}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Year Picker */}
              <ScrollView style={styles.pickerColumn} showsVerticalScrollIndicator={false}>
                {years.map((year) => (
                  <Pressable
                    key={year}
                    style={[
                      styles.pickerItem,
                      selectedYear === year && styles.selectedItem
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      selectedYear === year && styles.selectedItemText
                    ]}>
                      {year}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
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
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 200,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 16,
    color: '#111',
  },
  selectedItemText: {
    fontWeight: '600',
  },
});
