// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDV-K0Hu7AzKUG10oIpRnWEcAhYSDxaYYQ",
  authDomain: "ai-code-debug.firebaseapp.com",
  projectId: "ai-code-debug",
  storageBucket: "ai-code-debug.appspot.com",
  messagingSenderId: "436819563814",
  appId: "1:436819563814:web:436819563814",  // Using messageSenderId as a fallback if real app ID unavailable
  measurementId: "G-ABC123DEF"
};

// Initialize Firebase with error handling
let app;
let auth;
let db;

try {
  console.log("Initializing Firebase with config:", { ...firebaseConfig, apiKey: "HIDDEN" });
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Fallback initialization with minimal config
  try {
    const minimalConfig = {
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId
    };
    console.log("Trying minimal Firebase config:", { ...minimalConfig, apiKey: "HIDDEN" });
    app = initializeApp(minimalConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized with minimal config");
  } catch (fallbackError) {
    console.error("Fatal: Could not initialize Firebase even with minimal config:", fallbackError);
    // Set empty instances to prevent crashes
    app = null;
    auth = null;
    db = null;
  }
}

// Create Google provider with specific settings
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  client_id: '432873761264-8camv1a97cpeiq1gglih2j2klq2p97m1.apps.googleusercontent.com' // Your OAuth client ID
});

// Sign in with Google function with better error handling
const signInWithGoogle = async () => {
  try {
    // Log to debug the sign-in process
    console.log("Attempting Google sign-in...");
    auth.useDeviceLanguage();
    
    // Try with redirect instead of popup if popup fails repeatedly
    const result = await signInWithPopup(auth, googleProvider);
    console.log("Sign-in successful:", result.user);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    if (error.code === 'auth/popup-closed-by-user') {
      console.log("User closed the popup");
    } else if (error.code === 'auth/popup-blocked') {
      console.log("Popup was blocked by the browser");
      // You could try redirect here as fallback
    }
    
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

export { auth, db, signInWithGoogle, logOut, signInWithRedirect, GoogleAuthProvider }; 