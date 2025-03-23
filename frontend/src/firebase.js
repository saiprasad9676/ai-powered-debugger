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
  appId: "1:432873761264:web:0123456789abcdef", // Replace with actual App ID from Firebase console
  measurementId: "G-ABC123DEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create Google provider with specific settings
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google function with better error handling
const signInWithGoogle = async () => {
  try {
    // Log to debug the sign-in process
    console.log("Attempting Google sign-in...");
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Sign-in successful:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    throw error;
  }
};

// Sign out function
const logOut = async () => {
  try {
    await signOut(auth);
    console.log("Sign-out successful");
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
};

export { auth, db, signInWithGoogle, logOut }; 