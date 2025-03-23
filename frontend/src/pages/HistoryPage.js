import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

const HistoryPage = () => {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchHistory = () => {
      try {
        // Get history from localStorage
        const storedHistory = localStorage.getItem('codeHistory');
        if (storedHistory) {
          const allHistory = JSON.parse(storedHistory);
          const userHistory = allHistory[currentUser.uid] || [];
          
          // Sort by timestamp descending
          const sortedHistory = userHistory.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
          });
          
          // Add IDs to each history item if they don't have one
          const historyWithIds = sortedHistory.map((item, index) => ({
            id: item.id || `history-${index}`,
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          
          setHistory(historyWithIds.slice(0, 20)); // Limit to 20 entries like before
        } else {
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load your coding history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser, navigate]);

  const handleItemClick = (item) => {
    // Navigate to the app with the selected code
    navigate('/app', { state: { code: item.code, language: item.language } });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <div className="container">
          <h1 className="app-title">Your Coding History</h1>
          <p className="app-subtitle">
            Previous debugging sessions and code snippets
          </p>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="card">
            <div className="toolbar">
              <button onClick={() => navigate('/app')} className="back-button">
                Back to Debugger
              </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {history.length === 0 ? (
              <div className="empty-state">
                <h2>No History Yet</h2>
                <p>Your debugging sessions will appear here once you start using the app.</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="history-item"
                    onClick={() => handleItemClick(item)}
                  >
                    <div className="history-header">
                      <span className="history-language">{item.language}</span>
                      <span className="history-date">
                        {item.timestamp.toLocaleString()}
                      </span>
                    </div>
                    <div className="history-code-preview">
                      <pre>{item.code.substring(0, 150)}...</pre>
                    </div>
                    <div className="history-status">
                      {item.hadErrors ? (
                        <span className="status-error">Had Errors</span>
                      ) : (
                        <span className="status-success">No Errors</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} AI-Powered Code Debugger</p>
        </div>
      </footer>
    </div>
  );
};

export default HistoryPage; 