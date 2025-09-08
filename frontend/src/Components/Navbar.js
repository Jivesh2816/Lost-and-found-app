import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav>
      <div className="container">
        <div>
          <Link to={token ? "/dashboard" : "/login"} style={{ fontSize: '1.2rem', fontWeight: '700' }}>
            🔍 Lost & Found
          </Link>
        </div>
        <div className="nav-links">
          {token ? (
            <>
              <Link to="/posts">All Posts</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/create-post">Create Post</Link>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
