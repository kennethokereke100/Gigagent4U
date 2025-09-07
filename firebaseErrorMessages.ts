const firebaseErrorMessages: Record<string, string> = {
  "auth/user-not-found": "Email doesn't exist",
  "auth/invalid-email": "Invalid email format",
  "auth/wrong-password": "Incorrect password",
  "auth/email-already-in-use": "This email is already registered",
  "auth/weak-password": "Password is too weak (must be at least 6 characters)",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/network-request-failed": "Network error. Please check your internet connection.",
};

export function getFriendlyErrorMessage(code: string): string {
  return firebaseErrorMessages[code] || "Something went wrong. Please try again.";
}
