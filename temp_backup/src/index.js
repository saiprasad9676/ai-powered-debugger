import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';
import App from './App';
import LoginPage from './pages/LoginPage';
import ProfileSetup from './pages/ProfileSetup';
import HistoryPage from './pages/HistoryPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Routes that require authentication */}
          <Route element={<ProtectedRoute requireProfile={false} />}>
            <Route path="/profile-setup" element={<ProfileSetup />} />
          </Route>
          
          {/* Routes that require authentication and profile */}
          <Route element={<ProtectedRoute requireProfile={true} />}>
            <Route path="/app" element={<App />} />
            <Route path="/history" element={<HistoryPage />} />
          </Route>
          
          {/* Redirect to login by default */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();