import React, { useState } from 'react';
import ContactModal from './ContactModal';

const PostModal = ({ post, onClose }) => {
  const [imageEnlarged, setImageEnlarged] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  if (!post) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{post.title}</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ✕
          </button>
        </div>

        <div className="post-details">
          <div className="flex justify-between items-center mb-3">
            <span className={`status-badge status-${post.status}`}>
              {post.status === 'lost' ? '❌ Lost Item' : '✅ Found Item'}
            </span>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          {post.description && (
            <div className="mb-3">
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>📄 Description</h4>
              <p style={{ 
                color: '#4a5568', 
                lineHeight: '1.6',
                background: '#f7fafc',
                padding: '1rem',
                borderRadius: '8px',
                margin: 0
              }}>
                {post.description}
              </p>
            </div>
          )}

          <div className="post-info-grid">
            <div className="info-item">
              <strong>📂 Category:</strong>
              <span>{post.category}</span>
            </div>
            <div className="info-item">
              <strong>📍 Location:</strong>
              <span>{post.location}</span>
            </div>
            {post.userId && post.userId.name && (
              <div className="info-item">
                <strong>👤 Posted by:</strong>
                <span>{post.userId.name}</span>
              </div>
            )}
            {post.userId && post.userId.email && (
              <div className="info-item">
                <strong>📧 Contact:</strong>
                <span>{post.userId.email}</span>
              </div>
            )}
          </div>

          {post.image && (
            <div className="image-section">
              <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#2d3748' }}>📷 Image</h4>
              <div 
                className="image-container"
                onClick={() => setImageEnlarged(!imageEnlarged)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={`http://localhost:5000/${post.image}`}
                  alt={post.title}
                  className={imageEnlarged ? 'enlarged-image' : 'modal-image'}
                />
                <div className="image-overlay">
                  <span className="enlarge-hint">
                    {imageEnlarged ? 'Click to shrink' : 'Click to enlarge'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button 
              onClick={() => setShowContactModal(true)}
              style={{ 
                background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                marginRight: '1rem',
                flex: 1
              }}
            >
              📞 Contact Owner
            </button>
            <button 
              onClick={onClose} 
              style={{ 
                background: '#e2e8f0',
                color: '#4a5568',
                flex: 1
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .post-details {
          max-height: 70vh;
          overflow-y: auto;
        }

        .post-info-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
          margin: 1rem 0;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid #667eea;
        }

        .info-item strong {
          color: #2d3748;
          font-size: 0.9rem;
        }

        .info-item span {
          color: #4a5568;
          font-size: 1rem;
        }

        .image-section {
          margin: 1rem 0;
        }

        .image-container {
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .modal-image {
          width: 100%;
          max-width: 500px;
          height: 300px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .enlarged-image {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          max-width: 90vw;
          max-height: 90vh;
          width: auto;
          height: auto;
          z-index: 1001;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: white;
          padding: 1rem;
          border-radius: 0 0 12px 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .image-container:hover .image-overlay {
          opacity: 1;
        }

        .enlarge-hint {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .modal-actions {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .post-info-grid {
            grid-template-columns: 1fr;
          }
          
          .modal-image {
            height: 250px;
          }
          
          .enlarged-image {
            max-width: 95vw;
            max-height: 80vh;
          }
          
          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>

      {showContactModal && (
        <ContactModal 
          post={post} 
          onClose={() => setShowContactModal(false)} 
        />
      )}
    </div>
  );
};

export default PostModal;
