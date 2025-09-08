const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { createPost, getAllPosts, updatePostStatus } = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');  // to protect routes
const Post = require('../models/Post');
const { updatePostDetails, deletePost } = require('../controllers/postController');
// Public route to get all posts
router.get('/', getAllPosts);

// Protected route to get user's posts
router.get('/user', authMiddleware, async (req, res) => {
    try {
      const { title, category, status, location, page = 1, limit = 10 } = req.query;
  
      const filter = { userId: req.user.id };
      if (title) filter.title = { $regex: title, $options: 'i' };
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (location) filter.location = { $regex: location, $options: 'i' };
  
      const skip = (parseInt(page) - 1) * parseInt(limit);
  
      const posts = await Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));
  
      const total = await Post.countDocuments(filter);
  
      res.json({
        posts,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
      });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching user posts' });
    }
  });
  

// Protected routes require authentication
router.post(
    '/',
    authMiddleware,
    upload.single('image'),
    [
      body('title').notEmpty().withMessage('Title is required'),
      body('category').notEmpty().withMessage('Category is required'),
      body('location').notEmpty().withMessage('Location is required'),
      body('status').isIn(['lost', 'found']).withMessage('Status must be lost or found'),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    createPost
  );
  
  router.put(
    '/:id/edit',
    authMiddleware,
    [
        body('title').optional().notEmpty().withMessage('Title cannot be empty'),
        body('category').optional().notEmpty().withMessage('Category cannot be empty'),
        body('location').optional().notEmpty().withMessage('Location cannot be empty'),
        body('status').optional().isIn(['lost', 'found', 'returned']).withMessage('Invalid status value'),
    ],
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
    updatePostDetails
  );
  
  router.delete('/:id', authMiddleware, deletePost);
module.exports = router;
