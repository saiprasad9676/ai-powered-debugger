import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requireProfile = true }) => {
  const { currentUser, userProfile, loading } = useAuth();

  // If auth is loading, show loading indicator
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If profile is required but doesn't exist, redirect to profile setup
  if (requireProfile && !userProfile) {
    return <Navigate to="/profile-setup" />;
  }

  // If all checks pass, render the children
  return <Outlet />;
};

export default ProtectedRoute; 