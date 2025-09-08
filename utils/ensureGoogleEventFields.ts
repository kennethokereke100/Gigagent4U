import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

/**
 * Ensures a Google event document has all required fields for Firestore security rules
 * This function can be used to fix existing documents or validate new ones
 */
export async function ensureGoogleEventFields(eventId: string, eventData: any) {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const requiredFields = {
    createdBy: auth.currentUser.uid,
    userId: auth.currentUser.uid,
    updatedAt: serverTimestamp(),
  };

  // Check if any required fields are missing
  const missingFields: any = {};
  let hasMissingFields = false;

  if (!eventData.createdBy) {
    missingFields.createdBy = requiredFields.createdBy;
    hasMissingFields = true;
  }

  if (!eventData.userId) {
    missingFields.userId = requiredFields.userId;
    hasMissingFields = true;
  }

  // Always update the updatedAt timestamp
  missingFields.updatedAt = requiredFields.updatedAt;

  // If there are missing fields, update the document
  if (hasMissingFields) {
    console.log('🔧 Updating Google event with missing required fields:', missingFields);
    const eventRef = doc(db, 'googleevents', eventId);
    await updateDoc(eventRef, missingFields);
    console.log('✅ Google event updated with required fields');
  }

  return missingFields;
}

/**
 * Validates that a Google event data object has all required fields
 * Returns the data with required fields added if missing
 */
export function validateGoogleEventData(eventData: any) {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const validatedData = {
    ...eventData,
    // Ensure required fields are present
    createdBy: eventData.createdBy || auth.currentUser.uid,
    userId: eventData.userId || auth.currentUser.uid,
    createdAt: eventData.createdAt || serverTimestamp(),
    updatedAt: serverTimestamp(), // Always refresh on updates
  };

  return validatedData;
}
