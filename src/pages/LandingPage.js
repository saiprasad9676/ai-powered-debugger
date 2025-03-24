import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/profile-setup');
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E1E1E] to-[#2D2D2D] text-white">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Hero content */}
          <div className="space-y-8">
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              AI-Powered Code Debugger
            </h1>
            <p className="text-xl text-gray-300">
              Debug your code instantly with the power of AI. Get intelligent suggestions, 
              fix errors automatically, and improve your code quality in seconds.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center w-full md:w-auto px-8 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Continue with Google
              </button>
            </div>
          </div>

          {/* Right side - Features */}
          <div className="space-y-8 bg-[#2D2D2D] p-8 rounded-2xl">
            <h2 className="text-2xl font-bold">Key Features</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  🔍
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Code Analysis</h3>
                  <p className="text-gray-400">Advanced AI analyzes your code and identifies potential issues</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  ⚡
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Instant Fixes</h3>
                  <p className="text-gray-400">Get immediate suggestions and automatic error fixes</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  🌐
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Multiple Languages</h3>
                  <p className="text-gray-400">Supports Python, JavaScript, Java, C++, and more</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  📊
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Code History</h3>
                  <p className="text-gray-400">Track your debugging history and improvements</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 