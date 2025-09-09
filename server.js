const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // to load .env variables

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app'] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json()); // to parse JSON bodies
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/contact', contactRoutes);

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test endpoint to verify routes are working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API routes are working',
    routes: ['/api/auth/signup', '/api/auth/login', '/api/post', '/api/contact']
  });
});

// Basic route to check server is running
app.get('/', (req, res) => {
  res.send('API is running');
});

// Connect to MongoDB and start server
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/lost-and-found';
mongoose.connect(mongoURI).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check available at: http://0.0.0.0:${PORT}/health`);
  });
}).catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});
