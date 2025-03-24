import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfileSetup from './pages/ProfileSetup';
import DebugPage from './pages/DebugPage';
import HistoryPage from './pages/HistoryPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Protected route component
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    // Show loading indicator while checking auth state
    return <div className="loading-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    // Redirect to login if not authenticated
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          
          {/* Protected routes */}
          <Route path="/profile-setup" element={
            <PrivateRoute>
              <ProfileSetup />
            </PrivateRoute>
          } />
          
          <Route path="/app" element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } />
          
          <Route path="/debug" element={
            <PrivateRoute>
              <DebugPage />
            </PrivateRoute>
          } />
          
          <Route path="/history" element={
            <PrivateRoute>
              <HistoryPage />
            </PrivateRoute>
          } />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 