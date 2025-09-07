import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getFirestore, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth } from '../../firebaseConfig';

const BG = '#F5F3F0';
const db = getFirestore();

export default function LogoutScreen() {
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;

      if (user) {
        // Update Firestore user document to offline
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { status: 'offline', lastSeen: new Date() });
      }

      // Sign out from Firebase Auth
      await signOut(auth);

      setShowSheet(false);
      router.replace('/screen/Login');
    } catch (err) {
      console.error('Logout error:', err);
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
