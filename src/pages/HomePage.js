import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile } from '../utils/mongodb';
import '../styles/HomePage.css';

const HomePage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser?.email) {
        setLoading(false);
        return;
      }

      try {
        const userProfile = await getUserProfile(currentUser.email);
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.message === 'User not found') {
          // If profile doesn't exist, redirect to profile setup
          navigate('/profile-setup');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleDebug = () => {
    navigate('/debug');
  };

  const handleHistory = () => {
    navigate('/history');
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>AI-Powered Debugger</h1>
        <div className="user-info">
          {profile && (
            <span>Welcome, {profile.firstName} {profile.lastName}</span>
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="home-content">
        <div className="welcome-section">
          <h2>Welcome to Your AI Debugging Assistant</h2>
          <p>
            Get help with your code through our advanced AI-powered debugging tools. 
            Fix errors, improve your code, and enhance your programming skills.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card" onClick={handleDebug}>
            <div className="feature-icon">🔍</div>
            <h3>Debug Code</h3>
            <p>Fix errors and get detailed explanations for your code</p>
          </div>
          
          <div className="feature-card" onClick={handleHistory}>
            <div className="feature-icon">📝</div>
            <h3>View History</h3>
            <p>Access your previous debugging sessions</p>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        <p>&copy; 2023 AI-Powered Debugger. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage; 