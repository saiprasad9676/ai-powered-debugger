import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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

    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Get the list of history entries from MongoDB
        const response = await fetch(`${API_URL}/api/users/${userProfile._id}/history`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Format the timestamps and set state
        const formattedHistory = data.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp).toLocaleString()
        }));
        
        setHistory(formattedHistory);
        setError('');
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userProfile && userProfile._id) {
      fetchHistory();
    }
  }, [currentUser, navigate, userProfile]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Code History</h1>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Code History</h1>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Code History</h1>
      
      {history.length === 0 ? (
        <p className="text-gray-500">No history found. Start debugging some code to build your history!</p>
      ) : (
        <div className="grid gap-6">
          {history.map((item, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-800 shadow-md">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold">{item.language || 'Unknown language'}</h3>
                <span className="text-sm text-gray-400">{item.timestamp}</span>
              </div>
              <div className="mb-4">
                <h4 className="text-md font-medium mb-1">Original Code:</h4>
                <pre className="bg-gray-900 p-3 rounded overflow-x-auto">{item.originalCode}</pre>
              </div>
              {item.fixedCode && (
                <div className="mb-4">
                  <h4 className="text-md font-medium mb-1">Fixed Code:</h4>
                  <pre className="bg-gray-900 p-3 rounded overflow-x-auto">{item.fixedCode}</pre>
                </div>
              )}
              {item.errorMessage && (
                <div className="mb-2">
                  <h4 className="text-md font-medium mb-1">Error:</h4>
                  <p className="text-red-400">{item.errorMessage}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage; 
export default HistoryPage; 