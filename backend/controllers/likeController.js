const Like = require('../models/Like');
const Article = require('../models/Article');
const { validationResult } = require('express-validator');

// @desc    Toggle like on an article (like or unlike)
// @route   POST /api/likes
// @access  Private (authenticated users)
exports.toggleLike = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { articleId } = req.body;
    const userId = req.user.userId;

    // Verify article exists
    const article = await Article.findById(articleId).populate('author', 'username email role');
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user already liked this article
    const existingLike = await Like.findOne({ article: articleId, user: userId });

    if (existingLike) {
      // Unlike: Remove the like
      await Like.findByIdAndDelete(existingLike._id);

      // Emit real-time event to all users viewing this article
      if (req.io) {
        console.log(`👎 Emitting unlikeArticle to room: article_${articleId}`);
        req.io.to(`article_${articleId}`).emit('unlikeArticle', {
          articleId,
          userId,
          likeId: existingLike._id
        });
      }

      return res.json({
        success: true,
        message: 'Article unliked successfully',
        data: {
          liked: false,
          articleId,
          userId
        }
      });
    } else {
      // Like: Create a new like
      const like = await Like.create({
        article: articleId,
        user: userId
      });

      await like.populate('user', 'username email role');

      // Emit real-time event to all users viewing this article
      if (req.io) {
        console.log(`👍 Emitting likeArticle to room: article_${articleId}`);
        req.io.to(`article_${articleId}`).emit('likeArticle', {
          articleId,
          userId,
          likeId: like._id,
          user: like.user
        });
      }

      // Notify article author if someone else liked their article
      if (article.author._id.toString() !== userId) {
        const targetUserId = article.author._id;
        console.log(`📬 Emitting likeNotification to user_${targetUserId}`);

        // Save notification to database
        const { createNotification } = require('./notificationController');
        await createNotification({
          recipient: targetUserId,
          type: 'like',
          title: 'New Like',
          message: `${like.user.username} liked your article: ${article.title}`,
          article: article._id,
          articleTitle: article.title
        });

        req.io.to(`user_${targetUserId}`).emit('likeNotification', {
          message: `${like.user.username} liked your article: ${article.title}`,
          like,
          article: { _id: article._id, title: article.title }
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Article liked successfully',
        data: {
          liked: true,
          like,
          articleId,
          userId
        }
      });
    }

  } catch (error) {
    console.error('Toggle like error:', error);
    
    // Handle duplicate key error (shouldn't happen due to the check, but just in case)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this article'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// @desc    Get likes for an article
// @route   GET /api/likes/article/:articleId
// @access  Public
exports.getLikesByArticle = async (req, res) => {
  try {
    const { articleId } = req.params;

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get all likes for this article
    const likes = await Like.find({ article: articleId })
      .populate('user', 'username email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        articleId,
        count: likes.length,
        likes,
        likedBy: likes.map(like => like.user)
      }
    });

  } catch (error) {
    console.error('Get likes error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching likes',
      error: error.message
    });
  }
};

// @desc    Check if user liked an article
// @route   GET /api/likes/article/:articleId/check
// @access  Private
exports.checkUserLike = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.userId;

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user liked this article
    const like = await Like.findOne({ article: articleId, user: userId });

    res.json({
      success: true,
      data: {
        liked: !!like,
        likeId: like ? like._id : null
      }
    });

  } catch (error) {
    console.error('Check user like error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error checking like status',
      error: error.message
    });
  }
};

// @desc    Get all articles liked by a user
// @route   GET /api/likes/user/:userId
// @access  Public
exports.getLikesByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all likes by this user
    const likes = await Like.find({ user: userId })
      .populate({
        path: 'article',
        select: 'title content image tags author createdAt',
        populate: {
          path: 'author',
          select: 'username email role'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        userId,
        count: likes.length,
        likes,
        articles: likes.map(like => like.article).filter(article => article !== null)
      }
    });

  } catch (error) {
    console.error('Get user likes error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching user likes',
      error: error.message
    });
  }
};
