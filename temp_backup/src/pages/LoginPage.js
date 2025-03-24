import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithRedirect, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import '../styles.css';

const LoginPage = () => {
  const { currentUser, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupFailed, setPopupFailed] = useState(false);

  useEffect(() => {
    // If user is logged in, redirect to app
    if (currentUser) {
      navigate('/app');
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    
    try {
      setError('');
      setLoading(true);
      
      if (popupFailed) {
        // If popup failed before, try redirect method
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        provider.setCustomParameters({
          prompt: 'select_account'
        });
        await signInWithRedirect(auth, provider);
        return;
      }
      
      // Try popup first
      await googleSignIn();
      // Navigate will happen in the useEffect above when currentUser changes
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Failed to sign in with Google.';
      
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in canceled. You closed the popup.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Trying redirect method...';
        setPopupFailed(true);
        // Try redirect on next click
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = 'Multiple popups were detected. Please try again.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-container">
          <img src="/logo.svg" alt="AI Code Debugger Logo" className="app-logo" />
        </div>
        <h1 className="app-title">AI Code Debugger</h1>
        <p className="app-subtitle">Debug your code with the power of AI</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <button 
          onClick={handleGoogleSignIn} 
          className="google-signin-button"
          disabled={loading}
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
          {loading ? 'Signing in...' : popupFailed ? 'Continue with Google' : 'Sign in with Google'}
        </button>
        
        <p className="login-info">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage; 