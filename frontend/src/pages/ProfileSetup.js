import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

const ProfileSetup = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    dob: '',
  });

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // If user profile already exists, navigate to app
    if (userProfile && userProfile.username) {
      navigate('/app');
    }
    
    // Pre-fill form with existing data if available
    if (userProfile) {
      setFormData({
        username: userProfile.username || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        dob: userProfile.dob || '',
      });
    }
  }, [currentUser, userProfile, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log("Submit started - Form data:", formData);
    
    // Simple validation
    if (!formData.username || !formData.firstName || !formData.lastName || !formData.dob) {
      console.log("Validation failed - missing fields");
      setError('All fields are required');
      setLoading(false);
      return;
    }
    
    try {
      console.log("Calling updateUserProfile...");
      const success = await updateUserProfile(formData);
      console.log("Profile update result:", success);
      
      if (success) {
        console.log("Profile update successful, navigating to /app");
        setLoading(false); // Make sure to set loading to false before navigation
        // Small delay to ensure state updates before navigation
        setTimeout(() => {
          navigate('/app');
        }, 100);
      } else {
        console.error("Profile update returned false");
        setError('Failed to update profile');
        setLoading(false);
      }
    } catch (err) {
      console.error("Exception during profile update:", err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1 className="setup-title">Complete Your Profile</h1>
        <p className="setup-subtitle">Please provide the following information to get started</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="setup-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="setup-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup; 