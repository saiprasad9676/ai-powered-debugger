import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/HistoryPage.css';

const HistoryPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-debugger-backend.onrender.com';

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        console.log('Fetching history from:', `${API_URL}/api/history/${currentUser.email}`);
        const response = await axios.get(`${API_URL}/api/history/${currentUser.email}`);
        setHistory(response.data);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser, navigate, API_URL]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageIcon = (language) => {
    switch (language.toLowerCase()) {
      case 'python':
        return '🐍';
      case 'javascript':
        return 'JS';
      case 'java':
        return '☕';
      case 'cpp':
        return 'C++';
      case 'c':
        return 'C';
      default:
        return '📄';
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item === selectedItem ? null : item);
  };

  const handleDebugClick = () => {
    navigate('/debug');
  };

  const handleHomeClick = () => {
    navigate('/app');
  };

  if (loading) {
    return <div className="loading-container">Loading history...</div>;
  }

  return (
    <div className="history-container">
      <header className="history-header">
        <h1>Debugging History</h1>
        <div className="header-buttons">
          <button className="home-btn" onClick={handleHomeClick}>Home</button>
          <button className="debug-btn" onClick={handleDebugClick}>Debug Code</button>
        </div>
      </header>

      <div className="history-content">
        {error && <div className="error-message">{error}</div>}

        {history.length === 0 ? (
          <div className="no-history">
            <p>No debugging history found. Start debugging your code to see your history.</p>
            <button className="start-debugging-btn" onClick={handleDebugClick}>Start Debugging</button>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div 
                key={item._id} 
                className={`history-item ${selectedItem === item ? 'active' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <div className="history-item-header">
                  <div className="language-badge">
                    <span className="language-icon">{getLanguageIcon(item.language)}</span>
                    <span>{item.language}</span>
                  </div>
                  <span className="timestamp">{formatDate(item.timestamp)}</span>
                </div>

                <div className="code-preview">
                  <pre>{item.code.length > 100 ? `${item.code.slice(0, 100)}...` : item.code}</pre>
                </div>

                {selectedItem === item && (
                  <div className="history-details">
                    <div className="details-section">
                      <h3>Original Code</h3>
                      <pre>{item.code}</pre>
                    </div>
                    
                    {item.output && (
                      <div className="details-section">
                        <h3>Output</h3>
                        <pre>{item.output}</pre>
                      </div>
                    )}
                    
                    {item.changes && (
                      <div className="details-section">
                        <h3>Changes Made</h3>
                        <pre>{item.changes}</pre>
                      </div>
                    )}
                    
                    {item.suggestions && (
                      <div className="details-section">
                        <h3>Suggestions</h3>
                        <pre>{item.suggestions}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage; 