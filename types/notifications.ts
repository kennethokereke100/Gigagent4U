import { Timestamp } from 'firebase/firestore';

export type NotificationType = 'first_post' | 'gig_invite' | 'message' | 'application_confirmation' | 'new_application';

export type UserRole = 'talent' | 'promoter';

export interface Notification {
  userId: string;                 // owner of the notification
  role: UserRole;                 // user role
  type: NotificationType;         // notification type
  message: string;                // notification message
  cta?: string;                   // call-to-action text (optional)
  read: boolean;                  // whether notification has been read
  createdAt: Timestamp;           // when notification was created
}

export interface CreateNotificationData {
  userId: string;
  role: UserRole;
  type: NotificationType;
  message: string;
  cta?: string;
  read: boolean;
  createdAt: Timestamp;
}
