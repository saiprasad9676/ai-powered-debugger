import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

const Navbar = () => {
  const { currentUser, userProfile, signOutUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOutUser();
    navigate('/login');
  };
  
  if (!currentUser) return null;
  
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/app" className="navbar-brand">
          <span>AI Code Debugger</span>
        </Link>
        
        <ul className="navbar-menu">
          <li>
            <Link 
              to="/app" 
              className={`nav-item ${location.pathname === '/app' ? 'active' : ''}`}
            >
              Debugger
            </Link>
          </li>
          <li>
            <Link 
              to="/history" 
              className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}
            >
              History
            </Link>
          </li>
        </ul>
        
        {userProfile && (
          <div className="navbar-user">
            <span className="user-name">
              {userProfile.username || currentUser.displayName || currentUser.email}
            </span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 