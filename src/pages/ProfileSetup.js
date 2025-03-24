import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const { updateUserProfile, currentUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateUserProfile({
        ...formData,
        email: currentUser.email,
        uid: currentUser.uid
      });
      navigate('/debug');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
      <div className="bg-[#2D2D2D] rounded-lg shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-white mb-6">Complete Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#4F46E5]"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2" htmlFor="firstName">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#4F46E5]"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2" htmlFor="lastName">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#4F46E5]"
              placeholder="Enter your last name"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2" htmlFor="dateOfBirth">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              required
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#1E1E1E] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 rounded-lg text-white font-semibold ${
              saving 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-[#4F46E5] hover:bg-[#4338CA]'
            }`}
          >
            {saving ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetup; 