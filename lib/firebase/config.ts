// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDTkaSSlX0AQqnLpYRdqYS8mia1eTOpGlE",
  authDomain: "sighattire.firebaseapp.com",
  projectId: "sighattire",
  storageBucket: "sighattire.firebasestorage.app",
  messagingSenderId: "654449396280",
  appId: "1:654449396280:web:c10eb1971bb777a238b4cd",
  measurementId: "G-8SGG380L95"
};

// Initialize Firebase only if it hasn't been initialized already
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");
} else {
  app = getApps()[0];
  console.log("Using existing Firebase instance");
}

// Initialize Analytics only on the client side
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized");
  } catch (error) {
    console.warn("Failed to initialize Firebase Analytics:", error);
  }
}

// Initialize Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Log initialization status
console.log("Firebase services initialized:", {
  auth: !!auth,
  db: !!db,
  storage: !!storage,
  analytics: !!analytics
});