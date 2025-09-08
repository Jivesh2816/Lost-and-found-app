import React, { useEffect, useState } from 'react';

const ContactModal = ({ post, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      const prefill = { ...formData };
      if (payload?.name && !prefill.name) prefill.name = payload.name;
      if (payload?.email && !prefill.email) prefill.email = payload.email;
      setFormData(prefill);
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        })
      });
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || 'Server returned a non-JSON response');
      }
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.message || 'Failed to send contact request');
      }

      setSubmitMessage('✅ Contact request sent! The post owner will be notified.');
      
      // Clear form after successful submission
      setTimeout(() => {
        setFormData({ name: '', email: '', phone: '', message: '' });
        setSubmitMessage('');
        onClose();
      }, 2000);
      
    } catch (error) {
      setSubmitMessage(`❌ ${error.message || 'Failed to send contact request. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!post) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>📞 Contact Post Owner</h2>
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

        <div className="contact-info mb-4" style={{
          background: '#f7fafc',
          padding: '1rem',
          borderRadius: '8px',
          borderLeft: '4px solid #667eea'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748' }}>About the Item</h4>
          <p style={{ margin: 0, color: '#4a5568' }}>
            <strong>{post.title}</strong> - {post.status === 'lost' ? 'Lost Item' : 'Found Item'}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', color: '#718096', fontSize: '0.9rem' }}>
            Posted by: {post.userId?.name || 'Unknown User'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">👤 Your Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">📧 Your Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">📱 Phone Number (Optional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">💬 Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell the owner why you're contacting them..."
              rows="4"
              required
            />
          </div>

          {submitMessage && (
            <div className={`submit-message ${submitMessage.includes('✅') ? 'success' : 'error'}`}>
              {submitMessage}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={onClose}
              style={{ 
                background: '#e2e8f0', 
                color: '#4a5568',
                marginRight: '1rem'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ 
                background: isSubmitting ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer'
              }}
            >
              {isSubmitting ? '🔄 Sending...' : '📤 Send Contact Request'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2d3748;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .submit-message {
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          font-weight: 500;
          text-align: center;
        }

        .submit-message.success {
          background: #f0fff4;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }

        .submit-message.error {
          background: #fed7d7;
          color: #742a2a;
          border: 1px solid #feb2b2;
        }

        .contact-info h4 {
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .form-actions {
            flex-direction: column;
          }
          
          .form-actions button {
            width: 100%;
            margin: 0.25rem 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactModal;
