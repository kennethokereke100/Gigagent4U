import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useUserRole } from '../../contexts/UserRoleContext';
import { auth, db } from '../../firebaseConfig';

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
  role?: 'talent' | 'promoter'; // Accept role as prop
};

export default function GoalsSection({ onGoalPress, onDismiss, role: propRole }: Props) {
  const { role: contextRole } = useUserRole();
  const role = propRole || contextRole; // Use prop role if provided, otherwise use context
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  // Check profile completion
  const checkProfileCompletion = async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    
    try {
      const profileRef = doc(db, 'profiles', auth.currentUser.uid);
      const profileSnap = await getDoc(profileRef);
      
      if (!profileSnap.exists()) return false;
      
      const profileData = profileSnap.data();
      
      // Check if essential profile fields are completed
      const hasName = profileData.name && profileData.name.trim() !== '';
      const hasRole = profileData.role && profileData.role.trim() !== '';
      const hasCategories = profileData.categories && profileData.categories.length > 0;
      const hasAbout = profileData.about && profileData.about.trim() !== '';
      
      // For promoters, also check contact
      if (role === 'promoter') {
        const hasContact = profileData.contact && profileData.contact.trim() !== '';
        return hasName && hasRole && hasCategories && hasAbout && hasContact;
      }
      
      return hasName && hasRole && hasCategories && hasAbout;
    } catch (error) {
      console.error('Error checking profile completion:', error);
      return false;
    }
  };

  // Check if user has uploaded an event
  const checkEventUpload = async (): Promise<boolean> => {
    if (!auth.currentUser || role !== 'promoter') return false;
    
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const snapshot = await getDocs(postsQuery);
      return snapshot.docs.length > 0;
    } catch (error) {
      console.error('Error checking event upload:', error);
      return false;
    }
  };

  // Load goals with completion status
  useEffect(() => {
    const loadGoals = async () => {
      // Only load goals if user is authenticated and role is set
      if (!auth.currentUser || !role) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      const profileCompleted = await checkProfileCompletion();
      const eventUploaded = await checkEventUpload();
      
      const baseGoals: Goal[] = role === 'promoter' ? [
        {
          id: 'profile',
          label: 'Complete your profile',
          percentage: 0, // Start at 0%
          completed: profileCompleted,
        },
        {
          id: 'event',
          label: 'Upload an event',
          percentage: 0, // Start at 0%
          completed: eventUploaded,
        },
        {
          id: 'invite',
          label: 'Invite talent',
          percentage: 0, // Start at 0%
          completed: false, // Leave for later
        },
      ] : [
        {
          id: 'profile',
          label: 'Complete your profile',
          percentage: 0, // Start at 0%
          completed: profileCompleted,
        },
        {
          id: 'apply',
          label: 'Apply to gigs',
          percentage: 0, // Start at 0%
          completed: false, // Leave for later
        },
      ];
      
      setGoals(baseGoals);
      setLoading(false);
    };
    
    loadGoals();
  }, [role, auth.currentUser?.uid]); // Add auth.currentUser?.uid to dependencies

  // Reset goals when user changes to prevent cross-contamination
  useEffect(() => {
    if (!auth.currentUser) {
      setGoals([]);
      setShowConfetti(false);
    }
  }, [auth.currentUser?.uid]);

  // Calculate progress based on completed goals
  // Promoters: 3 goals (33.33% per goal), Talents: 2 goals (50% per goal)
  const completedGoals = goals.filter(goal => goal.completed).length;
  const progressPerGoal = role === 'promoter' ? 33.33 : 50;
  const progressPercentage = Math.min(100, completedGoals * progressPerGoal);
  const allGoalsCompleted = goals.length > 0 && goals.every(goal => goal.completed);

  // Trigger confetti when all goals are completed
  useEffect(() => {
    if (allGoalsCompleted && !loading) {
      setShowConfetti(true);
      // Hide confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [allGoalsCompleted, loading]);

  const handleGoalPress = (goal: Goal) => {
    if (onGoalPress) {
      onGoalPress(goal.id);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Loading goals...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Confetti Animation for All Goals Completed */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          fadeOut={true}
          autoStart={true}
          colors={['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']}
        />
      )}
      
      {/* Header with title and close button */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your goals is {Math.round(progressPercentage)}% complete</Text>
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
                {goal.completed ? '100%' : '0%'}
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
