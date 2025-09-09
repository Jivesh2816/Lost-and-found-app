import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('token', data.token);
      setMessage('Login successful! Redirecting...');
      // Redirect to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } else {
      setMessage(data.message || 'Login failed.');
    }
  };

  return (
    <div className="container fade-in">
      <h2>🔐 Login to Your Account</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="📧 Email Address" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="🔒 Password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
        />
        <button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>
          🚀 Login
        </button>
      </form>
      {message && (
        <div className={`text-center mt-2 ${message.includes('success') ? 'loading' : 'error'}`}>
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};

export default Login;
