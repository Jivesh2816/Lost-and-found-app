const Post = require('../models/Post');
const multer = require('multer');
// Create a new post
exports.createPost = async (req, res) => {
  try {
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    const { title, description, category, location, image, status } = req.body;
  
    // Get userId from authenticated user or request body
    const userId = req.user?.id || req.body.userId;
    let imagePath = '';
    if (req.file) {
      imagePath = req.file.path;
    }
    const newPost = new Post({
      title,
      description,
      category,
      location,
      image: imagePath,
      status,
      userId,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Create post error:', error);
    if (error instanceof multer.MulterError || (error.message && error.message.includes('Only images'))) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error during creating post' });
  }
};


exports.getAllPosts = async (req, res) => {
  try {
    const { title, category, status, location, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(filter)
      .populate('userId', 'name email')
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
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error during fetching posts' });
  }
};


// Update post status (e.g., mark as returned)
exports.updatePostDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, location, status } = req.body;

    // Fetch the post by ID
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ownership check
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: cannot edit others' posts" });
    }

    // Update fields if provided
    if (title !== undefined) post.title = title;
    if (description !== undefined) post.description = description;
    if (category !== undefined) post.category = category;
    if (location !== undefined) post.location = location;
    if (status !== undefined) {
      if (!['lost', 'found', 'returned'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      post.status = status;
    }

    const updatedPost = await post.save();
    res.json(updatedPost);

  } catch (error) {
    console.error('Update post details error:', error);
    res.status(500).json({ message: 'Server error during updating post details' });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Ownership check
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: cannot delete others' posts" });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error during deleting post' });
  }
};
