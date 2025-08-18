import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUserRole } from '../contexts/UserRoleContext';

const RoleSwitcher: React.FC = () => {
  const { role, setRole } = useUserRole();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Current Role: {role || 'None'}</Text>
      <View style={styles.buttonContainer}>
        <Pressable
          style={[styles.button, role === 'talent' && styles.activeButton]}
          onPress={() => setRole('talent')}
        >
          <Text style={[styles.buttonText, role === 'talent' && styles.activeButtonText]}>
            Set as Talent
          </Text>
        </Pressable>
        <Pressable
          style={[styles.button, role === 'promoter' && styles.activeButton]}
          onPress={() => setRole('promoter')}
        >
          <Text style={[styles.buttonText, role === 'promoter' && styles.activeButtonText]}>
            Set as Promoter
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeButton: {
    backgroundColor: '#111',
    borderColor: '#111',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  activeButtonText: {
    color: '#fff',
  },
});

export default RoleSwitcher;
