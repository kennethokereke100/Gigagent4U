import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export interface PostData {
  userId: string;
  type: string; // always "promoter" for now
  photoUrl: string;
  title: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
  time: string;
  contact: string;
  gigPrice: number;
}

export async function createPostInFirestore(postData: PostData) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");

  const postDoc = await addDoc(collection(db, "posts"), {
    ...postData,
    createdAt: serverTimestamp(),
  });

  return postDoc.id;
}
