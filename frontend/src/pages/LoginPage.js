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
    // If user is already logged in, redirect to profile setup or dashboard
    if (currentUser) {
      console.log("User already logged in, redirecting...");
      if (!currentUser.displayName) {
        navigate('/profile-setup');
      } else {
        navigate('/app');
      }
    }
  }, [currentUser, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      console.log("Handling Google sign-in click...");
      
      if (popupFailed) {
        // If popup failed before, use redirect method
        console.log("Using redirect method for sign-in...");
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        provider.setCustomParameters({
          prompt: 'select_account',
          client_id: '432873761264-8camv1a97cpeiq1gglih2j2klq2p97m1.apps.googleusercontent.com'
        });
        await signInWithRedirect(auth, provider);
        return; // This will redirect, so no need to continue
      }
      
      // Try popup method first
      await googleSignIn();
      // Navigation happens in the useEffect above
    } catch (error) {
      console.error('Failed to sign in with Google', error);
      setError(`Failed to sign in: ${error.message || 'Unknown error'}`);
      
      // If popup was blocked or other error, suggest using redirect next time
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        setPopupFailed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo.svg" alt="AI Code Debugger" className="logo-image" />
        </div>
        <h1 className="login-title">AI-Powered Code Debugger</h1>
        <p className="login-subtitle">Debug and enhance your code with AI</p>
        
        {error && <div className="error-message">{error}</div>}
        
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
        
        <button 
          className="google-signin-button" 
          onClick={handleGoogleSignIn}
          type="button"
          disabled={loading}
        >
          {loading ? (
            "Signing in..."
          ) : popupFailed ? (
            "Sign in with Google (Redirect)"
          ) : (
            <>
              <img 
                src="https://developers.google.com/identity/images/g-logo.png" 
                alt="Google" 
                className="google-icon" 
              />
              Sign in with Google
            </>
          )}
        </button>
        
        {popupFailed && (
          <p className="helper-text">Pop-up was blocked. Click again to use redirect method.</p>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 