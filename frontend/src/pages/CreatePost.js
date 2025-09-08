import React, { useState } from 'react';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    status: 'lost',
    image: null,
  });
  const [message, setMessage] = useState('');

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('You must be logged in to create a post.');
      return;
    }
    const data = new FormData();
    for (const key in formData) {
      if (formData[key]) data.append(key, formData[key]);
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/post`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
        body: data,
      });
      const result = await res.json();
      if (res.ok) {
        setMessage('Post created successfully!');
        // Optionally clear form or redirect
      } else {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        setMessage(result.message || 'Failed to create post.');
      }
    } catch (err) {
      setMessage('Error: ' + err.message);
    }
  };

  return (
    <div className="container fade-in">
      <h2>📝 Create Lost or Found Post</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="title" 
          placeholder="📝 What did you lose/find?" 
          value={formData.title} 
          onChange={handleChange} 
          required 
        />
        <textarea 
          name="description" 
          placeholder="📄 Describe the item in detail..." 
          value={formData.description} 
          onChange={handleChange}
          rows="4"
        />
        <input 
          type="text" 
          name="category" 
          placeholder="📂 Category (e.g., Books, Electronics, Clothing)" 
          value={formData.category} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="location" 
          placeholder="📍 Where did you lose/find it?" 
          value={formData.location} 
          onChange={handleChange} 
          required 
        />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="lost">❌ Lost Item</option>
          <option value="found">✅ Found Item</option>
        </select>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
            📷 Upload Image (Optional)
          </label>
          <input 
            type="file" 
            name="image" 
            accept="image/*" 
            onChange={handleChange}
            style={{ padding: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ width: '100%', fontSize: '1.1rem', padding: '1rem' }}>
          🚀 Create Post
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

export default CreatePost;
