import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

const LoginPage = () => {
  const { currentUser, googleSignIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect to profile setup or dashboard
    if (currentUser) {
      if (!currentUser.displayName) {
        navigate('/profile-setup');
      } else {
        navigate('/app');
      }
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      // Navigation happens in the useEffect above
    } catch (error) {
      console.error('Failed to sign in with Google', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo.png" alt="AI Code Debugger" className="logo-image" />
        </div>
        <h1 className="login-title">AI-Powered Code Debugger</h1>
        <p className="login-subtitle">Debug and enhance your code with AI</p>
        
        <div className="login-features">
          <div className="feature">
            <div className="feature-icon">⚡</div>
            <div className="feature-text">
              <h3>Instant Debugging</h3>
              <p>Get immediate feedback on code errors</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🔍</div>
            <div className="feature-text">
              <h3>Smart Suggestions</h3>
              <p>Receive AI-powered code improvement tips</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">🌐</div>
            <div className="feature-text">
              <h3>Multiple Languages</h3>
              <p>Support for Python, JavaScript, Java, C and C++</p>
            </div>
          </div>
        </div>
        
        <button className="google-signin-button" onClick={handleGoogleSignIn}>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
            alt="Google" 
            className="google-icon" 
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage; 