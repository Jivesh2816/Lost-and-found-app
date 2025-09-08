import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AllPosts from './pages/AllPosts';
import CreatePost from './pages/CreatePost';
import Navbar from './Components/Navbar';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  // Basic token validation - check if it exists and has 3 parts (header.payload.signature)
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  const tokenParts = token.split('.');
  if (tokenParts.length !== 3) {
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
  
  // Check if token is expired (basic check)
  try {
    const payload = JSON.parse(atob(tokenParts[1]));
    if (payload.exp && payload.exp < Date.now() / 1000) {
      localStorage.removeItem('token');
      return <Navigate to="/login" />;
    }
  } catch (e) {
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }
  
  return children;
};
const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute><AllPosts /></ProtectedRoute>} />
        <Route path="/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
      </Routes>
    </Router>
  );  
};

export default App;
