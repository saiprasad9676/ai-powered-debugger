import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/history/${currentUser.uid}?limit=5`);
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchHistory();
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <nav className="bg-[#2D2D2D] p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Debug History</h1>
          <button
            onClick={() => navigate('/debug')}
            className="px-4 py-2 bg-[#4F46E5] rounded-lg hover:bg-[#4338CA]"
          >
            Back to Debug
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-[#2D2D2D] rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Debug Sessions</h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-400">Loading history...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400">No debug history found</div>
              <button
                onClick={() => navigate('/debug')}
                className="mt-4 px-6 py-2 bg-[#4F46E5] rounded-lg hover:bg-[#4338CA]"
              >
                Start Debugging
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {history.map((item, index) => (
                <div key={index} className="bg-[#1E1E1E] rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-sm text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <div className="text-lg font-semibold mt-1">
                        {item.language.charAt(0).toUpperCase() + item.language.slice(1)} Code Debug
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-[#4F46E5] rounded-full text-sm">
                      {item.language}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Original Code</h3>
                      <pre className="bg-[#2D2D2D] p-3 rounded overflow-x-auto">
                        <code>{item.originalCode}</code>
                      </pre>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Debug Output</h3>
                      <pre className="bg-[#2D2D2D] p-3 rounded overflow-x-auto">
                        <code>{item.output}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage; 