import { collection, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export interface ApplicationData {
  userId: string;
  eventId: string;
  name: string;
  status: "pending";
  appliedAt: number;
  updatedAt: number;
}

export interface NotificationData {
  userId: string;
  type: "application" | "confirmation";
  eventId: string;
  fromUserId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
}

export async function createApplicationNotification(
  eventId: string,
  promoterUserId: string,
  talentUserId: string,
  talentName: string,
  eventTitle: string
) {
  console.log('🔄 Creating application notification with params:', {
    eventId,
    promoterUserId,
    talentUserId,
    talentName,
    eventTitle
  });

  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    // 1. Save the application to Firestore under events/{eventId}/candidates/{talentUserId}
    const applicationData: ApplicationData = {
      userId: talentUserId,
      eventId: eventId,
      name: talentName,
      status: "pending",
      appliedAt: Date.now(),
      updatedAt: Date.now()
    };

    console.log('💾 Saving application to Firestore:', applicationData);
    const candidateRef = doc(db, 'events', eventId, 'candidates', talentUserId);
    await setDoc(candidateRef, applicationData);
    console.log('✅ Application saved to Firestore');

    // 2. Create notification for the promoter
    console.log('📱 Creating promoter notification...');
    const promoterNotificationRef = doc(collection(db, 'notifications'));
    const promoterNotification: NotificationData = {
      userId: promoterUserId,
      type: "application",
      eventId: eventId,
      fromUserId: talentUserId,
      title: "New Application",
      message: `${talentName} applied to ${eventTitle}`,
      read: false,
      createdAt: Date.now()
    };
    await setDoc(promoterNotificationRef, promoterNotification);
    console.log('✅ Promoter notification created');

    // 3. Create notification for the talent (confirmation)
    console.log('📱 Creating talent notification...');
    const talentNotificationRef = doc(collection(db, 'notifications'));
    const talentNotification: NotificationData = {
      userId: talentUserId,
      type: "confirmation",
      eventId: eventId,
      fromUserId: promoterUserId,
      title: "Application Sent",
      message: `You applied to ${eventTitle}`,
      read: false,
      createdAt: Date.now()
    };
    await setDoc(talentNotificationRef, talentNotification);
    console.log('✅ Talent notification created');

    console.log('✅ Application and notifications created successfully');
    return true;
  } catch (error) {
    console.error('❌ Error creating application notification:', error);
    throw error;
  }
}