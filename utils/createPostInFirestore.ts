import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export interface PostData {
  userId: string;
  createdBy: string; // Required for Firestore rules
  type: string; // always "promoter" for now
  photoUrl: string;
  title: string;
  description: string;
  address: string;
  city: string; // Required for Firestore rules
  startDate: string;
  endDate: string;
  time: string;
  category: string; // Talent category selected by promoter (e.g., "Boxer", "Wrestler", etc.)
  // contact: string; // REMOVED: Contact info should come from /profiles/{userId}
  gigPrice: number;
}

export async function createPostInFirestore(postData: PostData) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  const postDoc = await addDoc(collection(db, "posts"), {
    ...postData,
    createdBy: user.uid, // Required for Firestore rules
    createdAt: Date.now(),
    updatedAt: Date.now()
  });

  return postDoc.id;
}
