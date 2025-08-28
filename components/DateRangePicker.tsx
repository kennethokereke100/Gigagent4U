import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
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

const daysOfWeek = ['S', 'M', 'T', 'W', 'Th', 'F', 'S'];

// Helper function to get days in a month
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get first day of month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};

// Helper function to format date as "Month Day Year"
const formatDate = (date: Date) => {
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  const suffix = getDaySuffix(day);
  return `${month} ${day}${suffix} ${year}`;
};

// Helper function to get day suffix (1st, 2nd, 3rd, etc.)
const getDaySuffix = (day: number) => {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
};

export default function DateRangePicker({ 
  startDate, 
  endDate, 
  onSelect, 
  placeholder = "Select date range" 
}: DateRangePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  
  // Calendar state
  const [startMonth, setStartMonth] = useState(new Date().getMonth());
  const [startYear, setStartYear] = useState(new Date().getFullYear());
  const [endMonth, setEndMonth] = useState(new Date().getMonth());
  const [endYear, setEndYear] = useState(new Date().getFullYear());

  const handleDone = () => {
    if (selectedStartDate && selectedEndDate) {
      const startDateStr = formatDate(selectedStartDate);
      const endDateStr = formatDate(selectedEndDate);
      onSelect(startDateStr, endDateStr);
    }
    setModalVisible(false);
  };

  const handleClear = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    onSelect('', '');
  };

  const handleDateSelect = (date: Date, isStartDate: boolean) => {
    if (isStartDate) {
      setSelectedStartDate(date);
      // If end date is before new start date, clear it
      if (selectedEndDate && selectedEndDate <= date) {
        setSelectedEndDate(null);
      }
    } else {
      // Only allow end date if start date is selected and end date is after start date
      if (selectedStartDate && date > selectedStartDate) {
        setSelectedEndDate(date);
      }
    }
  };

  const isDateDisabled = (date: Date, isStartDate: boolean) => {
    if (isStartDate) {
      // For start date, disable past dates
      return date < new Date(new Date().setHours(0, 0, 0, 0));
    } else {
      // For end date, disable dates before or equal to start date
      return !selectedStartDate || date <= selectedStartDate;
    }
  };

  const isDateSelected = (date: Date) => {
    if (!selectedStartDate && !selectedEndDate) return false;
    
    const dateStr = date.toDateString();
    return (
      (selectedStartDate && selectedStartDate.toDateString() === dateStr) ||
      (selectedEndDate && selectedEndDate.toDateString() === dateStr)
    );
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    
    const dateStr = date.toDateString();
    const startStr = selectedStartDate.toDateString();
    const endStr = selectedEndDate.toDateString();
    
    return dateStr > startStr && dateStr < endStr;
  };

  const renderCalendar = (month: number, year: number, isStartDate: boolean) => {
    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = [];
    const context = isStartDate ? 'start' : 'end';

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`${context}-empty-${i}`} style={styles.calendarDay} />);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const disabled = isDateDisabled(date, isStartDate);
      const selected = isDateSelected(date);
      const inRange = isDateInRange(date);

      days.push(
        <Pressable
          key={`${context}-day-${day}`}
          style={[
            styles.calendarDay,
            selected && styles.selectedDay,
            inRange && styles.rangeDay,
            disabled && styles.disabledDay
          ]}
          onPress={() => !disabled && handleDateSelect(date, isStartDate)}
          disabled={disabled}
        >
          <Text style={[
            styles.dayText,
            selected && styles.selectedDayText,
            inRange && styles.rangeDayText,
            disabled && styles.disabledDayText
          ]}>
            {day}
          </Text>
        </Pressable>
      );
    }

    return days;
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
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <Pressable onPress={handleDone}>
                <Text style={styles.headerButton}>Done</Text>
              </Pressable>
            </View>

            {/* Date Range Display */}
            <View style={styles.dateRangeDisplay}>
              <Text style={[
                styles.dateRangeText,
                selectedStartDate && styles.selectedDateText
              ]}>
                {selectedStartDate ? formatDate(selectedStartDate) : 'Start Date'}
              </Text>
              <Text style={styles.arrow}>→</Text>
              <Text style={[
                styles.dateRangeText,
                selectedEndDate && styles.selectedDateText
              ]}>
                {selectedEndDate ? formatDate(selectedEndDate) : 'End Date'}
              </Text>
            </View>

            {/* Calendar Container */}
            <View style={styles.calendarContainer}>
              {/* Start Date Calendar */}
              <View style={styles.calendarColumn}>
                <View style={styles.calendarHeader}>
                  <Pressable 
                    style={styles.monthButton}
                    onPress={() => {
                      if (startMonth > 0) {
                        setStartMonth(startMonth - 1);
                      } else {
                        setStartMonth(11);
                        setStartYear(startYear - 1);
                      }
                    }}
                  >
                    <Ionicons name="chevron-back" size={20} color="#007AFF" />
                  </Pressable>
                  <Text style={styles.monthYearText}>
                    {months[startMonth]} {startYear}
                  </Text>
                  <Pressable 
                    style={styles.monthButton}
                    onPress={() => {
                      if (startMonth < 11) {
                        setStartMonth(startMonth + 1);
                      } else {
                        setStartMonth(0);
                        setStartYear(startYear + 1);
                      }
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                  </Pressable>
                </View>
                
                <View style={styles.calendar}>
                  {/* Days of week header */}
                  <View style={styles.daysHeader}>
                    {daysOfWeek.map((day, idx) => (
                      <Text key={`start-${idx}-${day}`} style={styles.dayHeaderText}>{day}</Text>
                    ))}
                  </View>
                  
                  {/* Calendar grid */}
                  <View style={styles.calendarGrid}>
                    {renderCalendar(startMonth, startYear, true)}
                  </View>
                </View>
              </View>

              {/* End Date Calendar */}
              <View style={styles.calendarColumn}>
                <View style={styles.calendarHeader}>
                  <Pressable 
                    style={styles.monthButton}
                    onPress={() => {
                      if (endMonth > 0) {
                        setEndMonth(endMonth - 1);
                      } else {
                        setEndMonth(11);
                        setEndYear(endYear - 1);
                      }
                    }}
                  >
                    <Ionicons name="chevron-back" size={20} color="#007AFF" />
                  </Pressable>
                  <Text style={styles.monthYearText}>
                    {months[endMonth]} {endYear}
                  </Text>
                  <Pressable 
                    style={styles.monthButton}
                    onPress={() => {
                      if (endMonth < 11) {
                        setEndMonth(endMonth + 1);
                      } else {
                        setEndMonth(0);
                        setEndYear(endYear + 1);
                      }
                    }}
                  >
                    <Ionicons name="chevron-forward" size={20} color="#007AFF" />
                  </Pressable>
                </View>
                
                <View style={styles.calendar}>
                  {/* Days of week header */}
                  <View style={styles.daysHeader}>
                    {daysOfWeek.map((day, idx) => (
                      <Text key={`end-${idx}-${day}`} style={styles.dayHeaderText}>{day}</Text>
                    ))}
                  </View>
                  
                  {/* Calendar grid */}
                  <View style={styles.calendarGrid}>
                    {renderCalendar(endMonth, endYear, false)}
                  </View>
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
    maxHeight: '95%',
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
  dateRangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dateRangeText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedDateText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  arrow: {
    fontSize: 16,
    color: '#6B7280',
    marginHorizontal: 12,
  },
  calendarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  calendarColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  calendar: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    color: '#111',
  },
  selectedDay: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  rangeDay: {
    backgroundColor: '#E3F2FD',
  },
  rangeDayText: {
    color: '#007AFF',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: '#9CA3AF',
  },
});
