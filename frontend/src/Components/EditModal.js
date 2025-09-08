import React, { useState } from 'react';

const EditModal = ({ post, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: post.title || '',
    description: post.description || '',
    category: post.category || '',
    location: post.location || '',
    status: post.status || 'lost',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:5000/api/post/${post._id}/edit`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      const updatedPost = await res.json();
      onSave(updatedPost);  // update parent component's state
      onClose();
    } else {
      const error = await res.json();
      alert(error.message || 'Failed to update post');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Edit Post</h3>
        <form onSubmit={handleSubmit}>
          <input name="title" value={form.title} onChange={handleChange} required />
          <textarea name="description" value={form.description} onChange={handleChange} />
          <input name="category" value={form.category} onChange={handleChange} required />
          <input name="location" value={form.location} onChange={handleChange} required />
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
            <option value="returned">Returned</option>
          </select>
          <button type="submit">Save</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
