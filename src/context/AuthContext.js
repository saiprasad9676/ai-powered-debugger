import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  auth, 
  signInWithGoogle as firebaseSignInWithGoogle, 
  logOut as firebaseLogOut 
} from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// Define API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create or update user in MongoDB
  const syncUserWithMongoDB = async (user) => {
    if (!user) return null;
    
    try {
      // Check if user exists in MongoDB
      const response = await fetch(`${API_URL}/api/users?email=${encodeURIComponent(user.email)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.exists) {
          // User exists, update profile if needed
          return await fetchUserProfile(user.uid);
        } else {
          // Create new user
          const createResponse = await fetch(`${API_URL}/api/users`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uid: user.uid,
              email: user.email,
              display_name: user.displayName || user.email.split('@')[0],
              photo_url: user.photoURL || null
            })
          });
          
          if (createResponse.ok) {
            return await fetchUserProfile(user.uid);
          } else {
            console.error('Failed to create user in MongoDB');
            return null;
          }
        }
      } else {
        console.error('Failed to check user in MongoDB');
        return null;
      }
    } catch (error) {
      console.error("Error syncing user with MongoDB:", error);
      return null;
    }
  };

  // Fetch user profile from MongoDB
  const fetchUserProfile = async (userId) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`);
      
      if (response.ok) {
        return await response.json();
      } else {
        console.error('Failed to fetch user profile');
        return null;
      }
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
        try {
          // Sync user with MongoDB and get profile
          const profile = await syncUserWithMongoDB(user);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error syncing user with MongoDB:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser, syncUserWithMongoDB]);

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

  // Update user profile in MongoDB
  const updateUserProfile = async (profileData) => {
    if (!currentUser) {
      throw new Error("No authenticated user");
    }
    
    try {
      const response = await fetch(`${API_URL}/api/users/${currentUser.uid}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        return updatedProfile;
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  // Save coding history to MongoDB
  const saveCodeHistory = async (historyData) => {
    if (!currentUser || !userProfile) {
      console.error("Cannot save history: No authenticated user or profile");
      return null;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/users/${currentUser.uid}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: historyData.language || 'unknown',
          original_code: historyData.originalCode,
          fixed_code: historyData.fixedCode,
          error_message: historyData.errorMessage
        })
      });
      
      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to save history');
      }
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