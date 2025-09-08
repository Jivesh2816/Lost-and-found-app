const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // to load .env variables

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const contactRoutes = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.vercel.app'] 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(express.json()); // to parse JSON bodies
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/post', postRoutes);
app.use('/api/contact', contactRoutes);

// Basic route to check server is running
app.get('/', (req, res) => {
  res.send('API is running');
});

// Connect to MongoDB and start server
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/lost-and-found';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('MongoDB connection error:', error);
});
