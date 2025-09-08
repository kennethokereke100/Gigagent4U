import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';

const BG = '#F5F3F0';

export default function LogoutScreen() {
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      console.log('🚪 Starting logout process for user:', user?.uid);

      // Step 1: Update Firestore user document BEFORE signing out
      // This ensures we have proper permissions to update the document
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, { 
            status: 'offline', 
            lastSeen: new Date() 
          });
          console.log('✅ User status updated to offline');
        } catch (firestoreError) {
          // If Firestore update fails (e.g., user already signed out, race condition),
          // log warning but don't break the logout process
          console.warn('⚠️ Failed to update user status in Firestore:', firestoreError);
        }
      }

      // Step 2: Sign out from Firebase Auth
      // This must happen AFTER Firestore update to maintain permissions
      await signOut(auth);
      console.log('✅ User signed out successfully');

      // Step 3: Wait a moment for auth state to propagate and listeners to cleanup
      // This prevents race conditions where other screens might still try to access Firestore
      await new Promise(resolve => setTimeout(resolve, 100));

      // Step 4: Close modal and redirect to login
      setShowSheet(false);
      console.log('🔄 Navigating to login screen');
      router.replace('/screen/Login');
    } catch (err) {
      console.error('❌ Logout error:', err);
      // Even if logout fails, close the modal and try to redirect
      setShowSheet(false);
      try {
        router.replace('/screen/Login');
      } catch (navError) {
        console.error('❌ Navigation error during logout:', navError);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Want to logout?</Text>

          <Pressable 
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]} 
            onPress={() => setShowSheet(true)}
          >
            <Ionicons name="log-out-outline" size={22} color="#111" />
            <Text style={styles.rowLabel}>Logout</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom sheet confirm */}
      <Modal
        transparent
        visible={showSheet}
        animationType="slide"
        onRequestClose={() => setShowSheet(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetText}>Are you sure you want to log out?</Text>
            <Pressable style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
            <Pressable style={styles.cancelBtn} onPress={() => setShowSheet(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#111' },
  section: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 16 },
  sectionTitle: { fontSize: 14, color: '#6B7280', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  rowLabel: { fontSize: 16, color: '#111' },

  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: 20 },
  sheetText: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#111' },
  logoutBtn: { padding: 14, alignItems: 'center' },
  logoutText: { fontSize: 18, fontWeight: '600', color: 'red' },
  cancelBtn: { padding: 14, alignItems: 'center' },
  cancelText: { fontSize: 18, fontWeight: '500', color: '#111' },
});
