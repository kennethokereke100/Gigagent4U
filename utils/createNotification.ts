import { addDoc, collection, getDocs, query, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { CreateNotificationData, NotificationType, UserRole } from '../types/notifications';

/**
 * Creates a notification in Firestore
 */
export async function createNotification(
  userId: string,
  role: UserRole,
  type: NotificationType,
  message: string,
  cta?: string
): Promise<void> {
  try {
    const notificationData: CreateNotificationData = {
      userId,
      role,
      type,
      message,
      cta,
      read: false,
      createdAt: serverTimestamp() as any,
    };

    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

/**
 * Checks if a user has any posts in the posts collection
 */
export async function hasUserPostedBefore(userId: string): Promise<boolean> {
  try {
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(postsQuery);
    return snapshot.docs.length > 0;
  } catch (error) {
    console.error('❌ Error checking if user has posted before:', error);
    return false;
  }
}

/**
 * Creates a first post notification for promoters
 */
export async function createFirstPostNotification(userId: string, role: UserRole): Promise<void> {
  if (role !== 'promoter') {
    return;
  }

  try {
    // Check if user has posted before (this is called AFTER the post is created)
    const hasPostedBefore = await hasUserPostedBefore(userId);
    
    // If user has posted before, check if this is their first post (exactly 1 post)
    if (hasPostedBefore) {
      const postsQuery = query(
        collection(db, 'posts'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(postsQuery);
      
      // If there's exactly 1 post, this is their first post
      if (snapshot.docs.length === 1) {
        await createNotification(
          userId,
          role,
          'first_post',
          'Congratulations on your first event! Now invite a talent.',
          'Invite talent'
        );
      }
    }
  } catch (error) {
    console.error('❌ Error creating first post notification:', error);
  }
}

