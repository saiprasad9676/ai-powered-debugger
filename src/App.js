import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import pages
import HistoryPage from './pages/HistoryPage';

// Simple placeholder components (will be replaced with actual components later)
const LoginPage = () => {
  const { signInWithGoogle } = useAuth();
  
  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">AI Code Debugger</h1>
        <p className="mb-6 text-gray-300 text-center">Sign in to debug your code with AI assistance</p>
        <button 
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

const HomePage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-6">AI Code Debugger</h1>
    <p className="mb-4">Welcome to the AI Code Debugger. This tool helps you identify and fix bugs in your code.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">Debug Code</h2>
        <p className="mb-4">Upload or paste your code to get AI-powered debugging assistance.</p>
        <a href="/debug" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Start Debugging
        </a>
      </div>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-3">View History</h2>
        <p className="mb-4">Access your past debugging sessions and solutions.</p>
        <a href="/history" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          View History
        </a>
      </div>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container min-h-screen bg-gray-900 text-white">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App; 