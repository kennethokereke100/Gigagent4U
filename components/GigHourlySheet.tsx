import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface GigHourlySheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectAmount: (amount: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

export default function GigHourlySheet({
  visible,
  onClose,
  onSelectAmount,
}: GigHourlySheetProps) {
  const [amount, setAmount] = useState('0');
  const [hasUserInput, setHasUserInput] = useState(false);
  const [isExceeded, setIsExceeded] = useState(false);

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'backspace') {
      setAmount(prev => {
        if (prev.length === 1) {
          setHasUserInput(false);
          setIsExceeded(false);
          return '0';
        }
        
        const newAmount = prev.slice(0, -1);
        setHasUserInput(newAmount !== '0');
        
        // Check if still exceeded after backspace
        const numericValue = parseFloat(newAmount);
        setIsExceeded(numericValue > 9000.99);
        
        return newAmount;
      });
    } else if (key === '.') {
      setAmount(prev => {
        if (prev.includes('.')) return prev; // Already has decimal
        
        // Add decimal to current amount
        const newAmount = prev + '.';
        setHasUserInput(true);
        setIsExceeded(false); // Decimal doesn't exceed limit
        return newAmount;
      });
    } else if (key >= '0' && key <= '9') {
      setAmount(prev => {
        // If current amount is "0", replace it with the new digit
        if (prev === '0') {
          const newAmount = key;
          setHasUserInput(true);
          setIsExceeded(false);
          return newAmount;
        }
        
        // Split current amount into whole and decimal parts
        const parts = prev.split('.');
        const wholePart = parts[0];
        const decimalPart = parts[1] || '';
        
        // If we're in decimal mode (user has pressed .)
        if (prev.includes('.') && decimalPart.length < 2) {
          const newAmount = prev + key;
          setHasUserInput(true);
          
          // Check if exceeded after decimal input
          const numericValue = parseFloat(newAmount);
          setIsExceeded(numericValue > 9000.99);
          
          return newAmount;
        }
        
        // If we're building the whole number part
        const newWhole = wholePart + key;
        
        // Check if adding this digit would exceed 9000.99
        if (parseInt(newWhole) > 9000) {
          setIsExceeded(true);
          return prev; // Don't update amount, just show exceeded state
        }
        
        const newAmount = newWhole;
        setHasUserInput(true);
        setIsExceeded(false);
        return newAmount;
      });
    }
  }, []);

  const handleConfirm = useCallback(() => {
    if (isExceeded) {
      // Don't allow confirmation if amount is exceeded
      return;
    }
    
    // Format the amount with exactly 2 decimals before sending
    let formattedAmount = amount;
    if (!amount.includes('.')) {
      formattedAmount = amount + '.00';
    } else {
      const parts = amount.split('.');
      if (parts[1].length === 1) {
        formattedAmount = amount + '0';
      } else if (parts[1].length === 0) {
        formattedAmount = amount + '00';
      }
    }
    
    onSelectAmount(formattedAmount);
    onClose();
  }, [amount, onSelectAmount, onClose, isExceeded]);

  const resetAmount = useCallback(() => {
    setAmount('0');
    setHasUserInput(false);
    setIsExceeded(false);
  }, []);

  const keypadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', 'backspace']
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </Pressable>
            <Text style={styles.headerTitle}>Gig hourly rate</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Amount Section */}
          <View style={[
            styles.amountSection,
            isExceeded && styles.amountSectionExceeded
          ]}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Amount in USD</Text>
              <Text style={[
                styles.amountValue,
                isExceeded && styles.amountValueExceeded
              ]}>
                ${amount}
              </Text>
            </View>
            {isExceeded && (
              <Text style={styles.exceededMessage}>
                Amount cannot exceed $9,000.99
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable 
              style={[
                styles.actionButton, 
                hasUserInput && styles.actionButtonActive
              ]} 
              onPress={resetAmount}
            >
              <Text style={[
                styles.actionButtonText,
                hasUserInput && styles.actionButtonTextActive
              ]}>
                Reset
              </Text>
            </Pressable>
            <Pressable 
              style={[
                styles.confirmButton,
                isExceeded && styles.confirmButtonDisabled
              ]} 
              onPress={handleConfirm}
              disabled={isExceeded}
            >
              <Text style={[
                styles.confirmButtonText,
                isExceeded && styles.confirmButtonTextDisabled
              ]}>
                Confirm
              </Text>
            </Pressable>
          </View>

          {/* Numeric Keypad */}
          <View style={styles.keypad}>
            {keypadKeys.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.keypadRow}>
                {row.map((key) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.keypadKey,
                      key === 'backspace' && styles.backspaceKey
                    ]}
                    onPress={() => handleKeyPress(key)}
                    hitSlop={4}
                  >
                    {key === 'backspace' ? (
                      <Ionicons name="backspace-outline" size={24} color="#111" />
                    ) : (
                      <Text style={styles.keypadKeyText}>{key}</Text>
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '70%',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
  },
  amountSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  amountSectionExceeded: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111',
    textAlign: 'right',
    minWidth: 120,
  },
  amountValueExceeded: {
    color: '#EF4444',
  },
  exceededMessage: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  actionButtonActive: {
    backgroundColor: '#F5F5DC', // Light brown color when active
    borderColor: '#D4D4D4',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  actionButtonTextActive: {
    color: '#8B7355', // Darker brown text when active
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#111',
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
    opacity: 0.7,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  confirmButtonTextDisabled: {
    color: '#9CA3AF',
  },
  keypad: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    justifyContent: 'center',
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keypadKey: {
    width: (screenWidth - 80) / 3,
    height: 60,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  backspaceKey: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  keypadKeyText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
  },
});
