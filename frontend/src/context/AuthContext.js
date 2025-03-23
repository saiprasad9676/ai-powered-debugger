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

  // Load profile from localStorage when user logs in
  const loadProfileFromStorage = (userId) => {
    try {
      const storedProfiles = localStorage.getItem('userProfiles');
      if (storedProfiles) {
        const profiles = JSON.parse(storedProfiles);
        return profiles[userId] || null;
      }
    } catch (error) {
      console.error("Error loading profile from localStorage:", error);
    }
    return null;
  };

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        console.log("Auth state changed - user is logged in:", user.uid);
        // Get user profile from localStorage
        const profile = loadProfileFromStorage(user.uid);
        setUserProfile(profile);
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

  // Create or update user profile in localStorage
  const updateUserProfile = async (profileData) => {
    if (!currentUser) {
      console.error("Cannot update profile: No user is logged in");
      return false;
    }

    try {
      const userId = currentUser.uid;
      console.log("Updating profile for user:", userId);
      console.log("Profile data:", profileData);
      
      // Get existing profiles or initialize empty object
      const storedProfiles = localStorage.getItem('userProfiles');
      const profiles = storedProfiles ? JSON.parse(storedProfiles) : {};
      
      // Update profile for current user
      profiles[userId] = {
        ...profileData,
        email: currentUser.email,
        lastUpdated: new Date().toISOString(),
      };
      
      // Save back to localStorage
      localStorage.setItem('userProfiles', JSON.stringify(profiles));
      console.log("Profile saved to localStorage");
      
      // Update state
      setUserProfile({
        ...profileData,
        email: currentUser.email,
      });
      
      console.log("Profile updated successfully in state");
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      return false;
    }
  };

  // Save coding history to localStorage
  const saveCodeHistory = async (codeData) => {
    if (!currentUser) return false;

    try {
      const userId = currentUser.uid;
      const timestamp = new Date().toISOString();
      
      // Get existing history or initialize empty object
      const storedHistory = localStorage.getItem('codeHistory');
      const history = storedHistory ? JSON.parse(storedHistory) : {};
      
      // Initialize user's history if not exists
      if (!history[userId]) {
        history[userId] = [];
      }
      
      // Add new entry
      history[userId].push({
        ...codeData,
        timestamp,
      });
      
      // Save back to localStorage
      localStorage.setItem('codeHistory', JSON.stringify(history));
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