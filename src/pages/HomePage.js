import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { currentUser, logOut } = useAuth();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-4">
      <nav className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome, {currentUser?.displayName}</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/debug')}
            className="px-4 py-2 bg-[#4F46E5] rounded-lg hover:bg-[#4338CA]"
          >
            Debug Code
          </button>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 bg-[#2D2D2D] rounded-lg hover:bg-[#3D3D3D]"
          >
            History
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8">AI-Powered Code Debugger</h2>
        <p className="text-xl text-gray-300 mb-12">
          Debug your code instantly with the power of AI. Get intelligent suggestions,
          fix errors automatically, and improve your code quality in seconds.
        </p>
        <button
          onClick={() => navigate('/debug')}
          className="px-8 py-4 bg-[#4F46E5] rounded-lg text-xl hover:bg-[#4338CA] transition-colors"
        >
          Start Debugging
        </button>
      </div>
    </div>
  );
};

export default HomePage; 