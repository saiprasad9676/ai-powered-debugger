import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const { signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user is already authenticated, redirect appropriately
    if (currentUser) {
      console.log('User already logged in, redirecting');
      navigate('/app');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // The navigation will happen in the useEffect above when currentUser updates
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to sign in with Google. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-logo">
          <img src="/logo.png" alt="AI Debugger Logo" />
          <h1>AI-Powered Debugger</h1>
        </div>
        
        <div className="login-form">
          <h2>Welcome!</h2>
          <p className="login-description">
            Debug your code with the power of AI. Get instant solutions and explanations.
          </p>
          
          {error && <div className="login-error">{error}</div>}
          
          <button 
            className="google-signin-btn" 
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <FcGoogle className="google-icon" />
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>
        </div>
        
        <div className="login-features">
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">
              <h3>Instant Debugging</h3>
              <p>Fix errors in your code within seconds</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">💡</div>
            <div className="feature-text">
              <h3>Smart Suggestions</h3>
              <p>Get AI-powered recommendations to improve your code</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🔄</div>
            <div className="feature-text">
              <h3>Multiple Languages</h3>
              <p>Support for Python, JavaScript, Java, and more</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 