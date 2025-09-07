import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config for gigagent4u
const firebaseConfig = {
  apiKey: "AIzaSyDIWWxK72CSLcdubxps34lUtkHi0vQyie8",
  authDomain: "gigagent4u-b1c37.firebaseapp.com",
  projectId: "gigagent4u-b1c37",
  storageBucket: "gigagent4u-b1c37.appspot.com", // fixed domain
  messagingSenderId: "134303217363",
  appId: "1:134303217363:web:883012057cd9a5588f8626",
  measurementId: "G-D809113422"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Authentication instance
export const auth = getAuth(app);

// Export Firestore database instance
export const db = getFirestore(app);

// Export Firebase Storage instance
export const storage = getStorage(app);
