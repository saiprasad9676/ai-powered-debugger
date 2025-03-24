import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-debugger-backend.onrender.com';

export const saveUserProfile = async (userData) => {
  try {
    console.log('Saving user profile to:', `${API_BASE_URL}/api/users`);
    const response = await axios.post(`${API_BASE_URL}/api/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error saving profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to save user profile');
  }
};

export const getUserProfile = async (email) => {
  try {
    console.log('Fetching user profile from:', `${API_BASE_URL}/api/users/${email}`);
    const response = await axios.get(`${API_BASE_URL}/api/users/${email}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    console.error('Error fetching profile:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
  }
}; 