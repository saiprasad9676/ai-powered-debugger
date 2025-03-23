// Firebase authentication setup
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  signOut 
} from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDV-K0Hu7AzKUG10oIpRnWEcAhYSDxaYYQ',
  authDomain: 'ai-code-debug.firebaseapp.com',
  projectId: 'ai-code-debug',
  storageBucket: 'ai-code-debug.appspot.com',
  messagingSenderId: '436819563814',
  appId: '1:436819563814:web:436819563814'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Sign out
const logOut = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
};

// Export only auth-related functions and objects
export { 
  auth, 
  signInWithGoogle, 
  logOut,
  signInWithRedirect,
  GoogleAuthProvider
}; 