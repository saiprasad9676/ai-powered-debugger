import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  auth, 
  signInWithGoogle as firebaseSignInWithGoogle, 
  logOut as firebaseLogOut 
} from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile from localStorage
  const loadProfileFromStorage = (user) => {
    if (!user) return null;
    
    try {
      const storedProfile = localStorage.getItem(`user_profile_${user.uid}`);
      if (storedProfile) {
        return JSON.parse(storedProfile);
      }
      
      // Create default profile if none exists
      const defaultProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null,
        preferences: {}
      };
      
      // Save default profile
      localStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(defaultProfile));
      return defaultProfile;
    } catch (error) {
      console.error("Error loading profile from storage:", error);
      return null;
    }
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (user) {
        const profile = loadProfileFromStorage(user);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Google sign-in handler
  const signInWithGoogle = async () => {
    try {
      const user = await firebaseSignInWithGoogle();
      return user;
    } catch (error) {
      console.error("Error in googleSignIn:", error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (profileData) => {
    if (!currentUser) {
      throw new Error("No authenticated user");
    }
    
    try {
      // Get current profile
      const currentProfile = loadProfileFromStorage(currentUser) || {};
      
      // Update profile
      const updatedProfile = {
        ...currentProfile,
        ...profileData,
        lastUpdated: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem(`user_profile_${currentUser.uid}`, JSON.stringify(updatedProfile));
      
      // Update state
      setUserProfile(updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Save coding history
  const saveCodeHistory = async (historyData) => {
    if (!currentUser) {
      console.error("Cannot save history: No authenticated user");
      return null;
    }
    
    try {
      // Get current history
      const historyKey = `code_history_${currentUser.uid}`;
      const currentHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      // Add new history item
      const newHistoryItem = {
        ...historyData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      // Update history
      const updatedHistory = [newHistoryItem, ...currentHistory].slice(0, 50); // Keep only last 50 items
      
      // Save to localStorage
      localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
      
      return newHistoryItem;
    } catch (error) {
      console.error("Error saving code history:", error);
      return null;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    signInWithGoogle,
    logOut: firebaseLogOut,
    updateUserProfile,
    saveCodeHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 