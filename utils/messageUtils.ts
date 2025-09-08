import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export interface MessageData {
  id: string;
  senderId: string;
  text: string;
  createdAt: any; // Firestore Timestamp
  read: boolean;
}

export interface Conversation {
  id: string;
  members: string[]; // [currentUserId, otherUserId] (sorted)
  lastMessage: string;
  lastMessageAt: any; // Firestore Timestamp
  createdAt: any; // Firestore Timestamp
}

/**
 * Generate a consistent conversation ID from two user IDs
 */
export function generateConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

/**
 * Setup conversation between current user and another user
 * Checks if conversation exists, creates if not
 */
export async function setupConversation(otherUserId: string): Promise<string> {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const currentUserId = auth.currentUser.uid;
  const conversationId = generateConversationId(currentUserId, otherUserId);
  const conversationRef = doc(db, 'conversations', conversationId);
  
  try {
    console.log('🔍 Setting up conversation between:', currentUserId, 'and', otherUserId);
    console.log('🔍 Generated conversation ID:', conversationId);
    console.log('🔍 Auth state:', auth.currentUser ? 'authenticated' : 'not authenticated');
    
    // Try to create the conversation directly (setDoc will overwrite if exists)
    const conversationData = {
      id: conversationId,
      members: [currentUserId, otherUserId].sort(),
      lastMessage: '',
      lastMessageAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    
    console.log('🔄 Creating/updating conversation with data:', {
      ...conversationData,
      lastMessageAt: 'serverTimestamp()',
      createdAt: 'serverTimestamp()'
    });
    
    await setDoc(conversationRef, conversationData);
    console.log('✅ Conversation created/updated successfully:', conversationId);
    
    return conversationId;
  } catch (error) {
    console.error('❌ Error setting up conversation:', error);
    console.error('❌ Error details:', error);
    console.error('❌ Error code:', (error as any)?.code);
    console.error('❌ Error message:', (error as any)?.message);
    throw error;
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessage(
  conversationId: string,
  text: string
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const senderId = auth.currentUser.uid;
  
  try {
    console.log('📤 Sending message to conversation:', conversationId);
    
    // Add message to messages subcollection
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messageData: MessageData = {
      id: '', // Will be set by Firestore
      senderId,
      text: text.trim(),
      createdAt: serverTimestamp(),
      read: false
    };
    
    await addDoc(messagesRef, messageData);
    console.log('✅ Message added to subcollection');
    
    // Update conversation with last message info
    const conversationRef = doc(db, 'conversations', conversationId);
    await updateDoc(conversationRef, {
      lastMessage: text.trim(),
      lastMessageAt: serverTimestamp()
    });
    console.log('✅ Conversation updated with last message');
    
    console.log('✅ Message sent successfully');
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
}

/**
 * Get messages for a conversation
 */
export function getMessagesForConversation(
  conversationId: string,
  callback: (messages: MessageData[]) => void
): () => void {
  const messagesQuery = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  
  return onSnapshot(messagesQuery, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MessageData[];
    
    callback(messages);
  }, (error) => {
    console.error('❌ Error listening to messages:', error);
  });
}

/**
 * Get conversations for a user
 */
export function getConversationsForUser(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const conversationsQuery = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('lastMessageAt', 'desc')
  );
  
  return onSnapshot(conversationsQuery, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Conversation[];
    
    callback(conversations);
  }, (error) => {
    console.error('❌ Error listening to conversations:', error);
  });
}

/**
 * Create a message notification
 */
export async function createMessageNotification(
  receiverId: string,
  senderName: string,
  messageText: string,
  conversationId: string
): Promise<void> {
  try {
    const notificationRef = doc(collection(db, 'notifications'));
    const notificationData = {
      userId: receiverId,
      type: 'message',
      title: 'New Message',
      message: `${senderName} messaged you`,
      conversationId: conversationId,
      read: false,
      createdAt: Date.now()
    };
    
    await setDoc(notificationRef, notificationData);
    console.log('✅ Message notification created for:', receiverId);
  } catch (error) {
    console.error('❌ Error creating message notification:', error);
    throw error;
  }
}
