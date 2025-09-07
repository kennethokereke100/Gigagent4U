import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "../firebaseConfig";

export async function uploadImageToStorage(
  localUri: string,
  path: string
): Promise<string> {
  try {
    // Convert local URI to blob
    const response = await fetch(localUri);
    const blob = await response.blob();

    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, path);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Storage:", error);
    throw new Error("Failed to upload image");
  }
}

export async function uploadEventImage(
  blob: Blob,
  timestamp: string
): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const path = `eventImages/${user.uid}/${timestamp}.jpg`;
  
  try {
    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, path);

    // Upload the blob directly
    const snapshot = await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image to Storage:", error);
    throw new Error("Failed to upload image");
  }
}
