import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      if (user) {
        navigate('/profile-setup');
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-4">
      <div className="bg-[#2D2D2D] rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            AI Code Debugger
          </h1>
          <p className="text-xl text-gray-300">
            Debug your code instantly with AI-powered suggestions
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-center space-x-4 text-white">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl">
              🔍
            </div>
            <div>
              <h3 className="font-semibold text-lg">Smart Analysis</h3>
              <p className="text-gray-400">Instant code verification and error detection</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-white">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-2xl">
              ⚡
            </div>
            <div>
              <h3 className="font-semibold text-lg">Quick Fixes</h3>
              <p className="text-gray-400">Get immediate solutions for your code issues</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-white">
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-2xl">
              🌐
            </div>
            <div>
              <h3 className="font-semibold text-lg">Multiple Languages</h3>
              <p className="text-gray-400">Support for Python, JavaScript, Java, C++, and C</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-2 bg-white text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default LandingPage; 