import React, { useEffect, useState } from 'react';
import EditModal from '../Components/EditModal';


const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [editingPost, setEditingPost] = useState(null);


  useEffect(() => {
    const fetchUserPosts = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in');
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/post/user`, {
          headers: {
            'Authorization': 'Bearer ' + token,
          },
        });
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
            return;
          }
          throw new Error('Failed to fetch posts');
        }
        const data = await res.json();
        setPosts(data.posts || data); // adjust if backend returns different structure
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserPosts();
  }, []);

  // Delete post handler
  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/post/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (res.ok) {
      setPosts(posts.filter(post => post._id !== id));
    } else {
      if (res.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }
      const error = await res.json();
      alert(error.message || 'Failed to delete post');
    }
  };

  // Placeholder for edit handler
  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const handleCloseModal = () => {
    setEditingPost(null);
  };

  const handleEditSave = async (updatedPost) => {
    // TODO: Implement edit save functionality
    console.log('Edit save:', updatedPost);
    setEditingPost(null);
  };

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>My Lost & Found Posts</h2>
      {posts.length === 0 && <p>No posts found.</p>}
      <ul>
        {posts.map(post => (
          <li key={post._id}>
            <strong>{post.title}</strong> — {post.status}
            <br />
            Category: {post.category}
            <br />
            Location: {post.location}
            <br />
            {post.image && <img src={`http://localhost:5000/${post.image}`} alt={post.title} width="100" />}
            <br />
            <button onClick={() => handleEdit(post)}>Edit</button>{' '}
            <button onClick={() => handleDelete(post._id)}>Delete</button>
          </li>
        ))}
      </ul>

      {editingPost && (
        <EditModal
          post={editingPost}
          onClose={handleCloseModal}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
};

export default Dashboard;



  