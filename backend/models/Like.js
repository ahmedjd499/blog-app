const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
likeSchema.index({ article: 1, user: 1 }, { unique: true }); // A user can only like an article once
likeSchema.index({ article: 1, createdAt: -1 });

module.exports = mongoose.model('Like', likeSchema);
