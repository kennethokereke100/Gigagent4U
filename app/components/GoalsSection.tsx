import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUserRole } from '../../contexts/UserRoleContext';

type Goal = {
  id: string;
  label: string;
  percentage: number;
  completed: boolean;
  action?: () => void;
};

type Props = {
  onGoalPress?: (goalId: string) => void;
  onDismiss?: () => void;
};

export default function GoalsSection({ onGoalPress, onDismiss }: Props) {
  const { role } = useUserRole();

  // Define goals based on role
  const getGoals = (): Goal[] => {
    if (role === 'promoter') {
      return [
        {
          id: 'profile',
          label: 'Complete your profile',
          percentage: 15,
          completed: false,
        },
        {
          id: 'event',
          label: 'Upload an event',
          percentage: 15,
          completed: false,
        },
        {
          id: 'invite',
          label: 'Invite talent',
          percentage: 15,
          completed: false,
        },
      ];
    } else {
      // talent role
      return [
        {
          id: 'profile',
          label: 'Complete your profile',
          percentage: 15,
          completed: false,
        },
        {
          id: 'skills',
          label: 'Add your skills',
          percentage: 15,
          completed: false,
        },
        {
          id: 'apply',
          label: 'Apply to gigs',
          percentage: 15,
          completed: false,
        },
      ];
    }
  };

  const goals = getGoals();
  const totalProgress = goals.reduce((sum, goal) => sum + (goal.completed ? goal.percentage : 0), 0);
  const progressPercentage = Math.min(100, totalProgress);

  const handleGoalPress = (goal: Goal) => {
    if (onGoalPress) {
      onGoalPress(goal.id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with title and close button */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your goals is {progressPercentage}% complete</Text>
        {onDismiss && (
          <Pressable onPress={onDismiss} hitSlop={8}>
            <Ionicons name="close" size={20} color="#F0F0F0" />
          </Pressable>
        )}
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>

      {/* Description */}
      <Text style={styles.description}>
        Complete the steps below to finish your profile and unlock your next goals.
      </Text>

      {/* Goals List */}
      <View style={styles.goalsContainer}>
        {goals.map((goal) => (
          <Pressable
            key={goal.id}
            style={styles.goalRow}
            onPress={() => handleGoalPress(goal)}
          >
            <View style={styles.goalContent}>
              <Text style={styles.goalLabel}>
                {goal.label}
              </Text>
              <Text style={styles.goalPercentage}>
                {goal.percentage}%
              </Text>
            </View>
            {goal.completed && (
              <Ionicons name="checkmark-circle" size={20} color="#FDD835" />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#363636',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 0,
    marginVertical: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F0F0F0',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#6B6B6B',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FDD835',
    borderRadius: 4,
  },
  description: {
    fontSize: 14,
    color: '#F0F0F0',
    lineHeight: 20,
    marginBottom: 16,
  },
  goalsContainer: {
    gap: 12,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 14,
    color: '#F0F0F0',
    flex: 1,
  },
  goalPercentage: {
    fontSize: 14,
    color: '#F0F0F0',
    marginLeft: 12,
  },
});
