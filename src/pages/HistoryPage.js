import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Define API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const HistoryPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch history from MongoDB
  const fetchHistory = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/users/${currentUser.uid}/history`);
      
      if (response.ok) {
        const historyData = await response.json();
        
        // Format timestamps for display
        const formattedHistory = historyData.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp).toLocaleString(),
          // Map backend field names to frontend expected names if necessary
          id: item._id || item.id,
          originalCode: item.original_code,
          fixedCode: item.fixed_code,
          errorMessage: item.error_message,
          language: item.language
        }));
        
        setHistory(formattedHistory);
        setError('');
      } else {
        throw new Error('Failed to fetch history');
      }
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // Fetch history from MongoDB
    fetchHistory();
  }, [currentUser, navigate, fetchHistory]);

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
            <div key={item.id || index} className="border rounded-lg p-4 bg-gray-800 shadow-md">
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