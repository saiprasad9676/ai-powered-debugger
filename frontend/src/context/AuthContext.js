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

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
        console.error("Error handling redirect result:", error);
      }
    };

    handleRedirectResult();
  }, []);

  // Create or update user in MongoDB when Firebase auth state changes
  const syncUserWithMongoDB = async (user) => {
    if (!user) return null;
    
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          display_name: user.displayName || user.email.split('@')[0],
          photo_url: user.photoURL || null
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error("Error syncing user with MongoDB:", error);
      return null;
    }
  };

  // Fetch user profile from MongoDB
  const fetchUserProfile = async (userId) => {
    if (!userId) return null;
    
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      
      const profileData = await response.json();
      return profileData;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Sync user with MongoDB and get profile
        const dbUser = await syncUserWithMongoDB(user);
        if (dbUser) {
          const userProfile = await fetchUserProfile(dbUser._id);
          setUserProfile(userProfile);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Google sign-in handler
  const googleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      return user;
    } catch (error) {
      console.error("Error in googleSignIn:", error);
      throw error;
    }
  };

  // Update user profile (name, preferences, etc.)
  const updateUserProfile = async (profileData) => {
    if (!currentUser) {
      throw new Error("No authenticated user");
    }
    
    try {
      // Get the MongoDB user first
      const dbUser = await syncUserWithMongoDB(currentUser);
      if (!dbUser) {
        console.error("Failed to get MongoDB user");
        throw new Error("Failed to get user reference");
      }
      
      // Update profile in MongoDB
      const response = await fetch(`${API_URL}/api/users/${dbUser._id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      
      const updatedProfile = await response.json();
      setUserProfile(updatedProfile);
      console.log("Profile updated successfully in MongoDB");
      
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Save coding history to MongoDB
  const saveCodeHistory = async (historyData) => {
    if (!currentUser) {
      console.error("Cannot save history: No authenticated user");
      return null;
    }
    
    try {
      // Get the MongoDB user first
      const dbUser = await syncUserWithMongoDB(currentUser);
      if (!dbUser) {
        console.error("Failed to get MongoDB user");
        return null;
      }
      
      // Save history to MongoDB
      const response = await fetch(`${API_URL}/api/users/${dbUser._id}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...historyData,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }
      
      const savedHistory = await response.json();
      return savedHistory;
    } catch (error) {
      console.error("Error saving code history:", error);
      return null;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    googleSignIn,
    logOut,
    updateUserProfile,
    saveCodeHistory
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 