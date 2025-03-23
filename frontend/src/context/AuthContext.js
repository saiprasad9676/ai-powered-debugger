import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  auth, 
  signInWithGoogle, 
  logOut 
} from "../firebase";
import { 
  onAuthStateChanged, 
  getRedirectResult 
} from "firebase/auth";
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle redirect result
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          console.log("Redirect sign-in successful:", result.user);
        }
      } catch (error) {
        console.error("Error with redirect sign-in:", error);
      }
    };

    handleRedirectResult();
  }, []);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        console.log("Auth state changed - user is logged in:", user.uid);
        // Get user profile from Firestore
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          setUserProfile(null);
        }
      } else {
        console.log("Auth state changed - no user is logged in");
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in with Google
  const googleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  // Sign out
  const signOutUser = async () => {
    try {
      await logOut();
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      return false;
    }
  };

  // Create or update user profile
  const updateUserProfile = async (profileData) => {
    if (!currentUser) return false;

    try {
      const userRef = doc(db, "users", currentUser.uid);
      await setDoc(userRef, {
        ...profileData,
        email: currentUser.email,
        lastUpdated: serverTimestamp(),
      }, { merge: true });

      setUserProfile({
        ...profileData,
        email: currentUser.email,
      });

      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    }
  };

  // Save coding history
  const saveCodeHistory = async (codeData) => {
    if (!currentUser) return false;

    try {
      const historyRef = doc(db, "users", currentUser.uid, "history", new Date().toISOString());
      await setDoc(historyRef, {
        ...codeData,
        timestamp: serverTimestamp(),
      });
      return true;
    } catch (error) {
      console.error("Error saving code history:", error);
      return false;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    googleSignIn,
    signOutUser,
    updateUserProfile,
    saveCodeHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 