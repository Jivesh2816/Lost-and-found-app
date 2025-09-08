const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  location: String,
  image: String,  // store image path or URL
  status: { type: String, enum: ['lost', 'found'], default: 'lost' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

module.exports = mongoose.model('Post', postSchema);
