import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile, getUserProfile } from '../utils/mongodb';
import '../styles/ProfileSetup.css';

const ProfileSetup = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    const checkExistingProfile = async () => {
      if (!currentUser?.email) {
        console.log('No user email found, cannot check for existing profile');
        return;
      }
      
      console.log('Checking for existing profile for:', currentUser.email);
      try {
        const userProfile = await getUserProfile(currentUser.email);
        console.log('User profile found:', userProfile);
        if (userProfile) {
          navigate('/app');
        }
      } catch (error) {
        if (error.message !== 'User not found') {
          console.error('Error checking profile:', error);
          setError(`Error checking profile: ${error.message}`);
        } else {
          console.log('No existing profile found, showing profile setup form');
        }
      }
    };
    
    checkExistingProfile();
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!currentUser?.email) {
        throw new Error('No user email found');
      }

      console.log('Submitting profile data:', { ...formData, email: currentUser.email });

      // Validate all fields are filled
      for (const [key, value] of Object.entries(formData)) {
        if (!value.trim()) {
          throw new Error(`${key} is required`);
        }
      }

      // Save to MongoDB
      const savedProfile = await saveUserProfile({
        ...formData,
        email: currentUser.email
      });
      
      console.log('Profile saved successfully:', savedProfile);
      navigate('/app');
    } catch (err) {
      console.error('Profile save error:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  // If no user is logged in, redirect to login
  useEffect(() => {
    if (!currentUser && !localStorage.getItem('authLoading')) {
      console.log('No user logged in, redirecting to login');
      navigate('/');
    }
  }, [currentUser, navigate]);

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <h2>Complete Your Profile</h2>
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-button">
              ×
            </button>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
            />
          </div>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
          <div className="form-group">
            <label>Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>
          <button 
            type="submit" 
            className="submit-button"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup; 