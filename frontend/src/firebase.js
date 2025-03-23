// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAas7BLrcdxCk7FS5LV7fGEI-5352vh9k0",
  authDomain: "ai-powered-debugger.firebaseapp.com",
  projectId: "ai-powered-debugger",
  storageBucket: "ai-powered-debugger.appspot.com",
  messagingSenderId: "432873761264",
  appId: "1:432873761264:web:YOUR_APP_ID", // You'll need to replace this with your actual app ID
  measurementId: "G-ABC123DEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google sign-in
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    return null;
  }
};

// Sign out
const logOut = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error signing out", error);
    return false;
  }
};

export { auth, db, signInWithGoogle, logOut }; 