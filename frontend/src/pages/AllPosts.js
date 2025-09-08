import React, { useEffect, useState } from 'react';
import PostModal from '../Components/PostModal';
import ContactModal from '../Components/ContactModal';

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [contactPost, setContactPost] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        title: search,
        category,
        status,
        page,
      }).toString();

      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/post?${params}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      const data = await res.json();
      setPosts(data.posts || []);
      setPagination({ page: data.page || 1, totalPages: data.totalPages || 1 });
      setError('');
    } catch (err) {
      setError(err.message);
      setPosts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, status, page]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleContactClick = (e, post) => {
    e.stopPropagation(); // Prevent opening the post modal
    setContactPost(post);
  };

  const handleCloseContactModal = () => {
    setContactPost(null);
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="container fade-in">
      <h2>🔍 All Lost & Found Items</h2>
      
      <div className="search-container">
        <div className="search-filters">
          <input
            type="text"
            placeholder="🔍 Search by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">📂 All Categories</option>
            <option value="Books">📚 Books</option>
            <option value="Clothing">👕 Clothing</option>
            <option value="Electronics">📱 Electronics</option>
            <option value="Sports">⚽ Sports</option>
            <option value="Accessories">💍 Accessories</option>
            <option value="Other">📦 Other</option>
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">🏷️ All Status</option>
            <option value="lost">❌ Lost</option>
            <option value="found">✅ Found</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <p>🔄 Loading posts...</p>
        </div>
      ) : !posts || posts.length === 0 ? (
        <div className="loading">
          <p>😔 No posts found. Try adjusting your search filters.</p>
        </div>
      ) : (
        <ul>
          {posts.map(post => (
            <li 
              key={post._id} 
              className="fade-in post-card"
              onClick={() => handlePostClick(post)}
              style={{ cursor: 'pointer' }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 style={{ margin: 0, color: '#2d3748' }}>{post.title}</h3>
                <span className={`status-badge status-${post.status}`}>
                  {post.status === 'lost' ? '❌ Lost' : '✅ Found'}
                </span>
              </div>
              
              {post.description && (
                <p style={{ color: '#718096', marginBottom: '1rem' }}>
                  {post.description.length > 100 
                    ? `${post.description.substring(0, 100)}...` 
                    : post.description
                  }
                </p>
              )}
              
              <div style={{ marginBottom: '1rem' }}>
                <strong>📂 Category:</strong> {post.category} <br />
                <strong>📍 Location:</strong> {post.location}
              </div>
              
              {post.image && (
                <img
                  src={`http://localhost:5000/${post.image}`}
                  alt={post.title}
                />
              )}
              
              <div className="post-actions" style={{ 
                display: 'flex',
                gap: '0.5rem',
                marginTop: '1rem',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={(e) => handleContactClick(e, post)}
                  style={{
                    background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    flex: 1
                  }}
                >
                  📞 Contact
                </button>
                <div className="click-hint" style={{ 
                  textAlign: 'center', 
                  color: '#667eea', 
                  fontSize: '0.8rem',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.5rem'
                }}>
                  👆 Click for details
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="text-center mt-2">
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          ← Previous
        </button>
        <span style={{ margin: '0 1rem', color: '#4a5568' }}>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>
          Next →
        </button>
      </div>

      {selectedPost && (
        <PostModal 
          post={selectedPost} 
          onClose={handleCloseModal} 
        />
      )}

      {contactPost && (
        <ContactModal 
          post={contactPost} 
          onClose={handleCloseContactModal} 
        />
      )}
    </div>
  );
};

export default AllPosts;
