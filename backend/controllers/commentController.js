const Comment = require('../models/Comment');
const Article = require('../models/Article');
const { validationResult } = require('express-validator');

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private (authenticated users)
exports.createComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content, articleId, parentCommentId } = req.body;

    // Verify article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // If replying to a comment, verify parent comment exists
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
      
      // Ensure parent comment belongs to the same article
      if (parentComment.article.toString() !== articleId) {
        return res.status(400).json({
          success: false,
          message: 'Parent comment does not belong to this article'
        });
      }
    }

    const comment = await Comment.create({
      content,
      article: articleId,
      author: req.user.userId,
      parentComment: parentCommentId || null
    });

    await comment.populate([
      { path: 'author', select: 'username email role' },
      { path: 'article', select: 'title author' }
    ]);

    // Emit real-time event to all users viewing this article
    if (req.io) {
      req.io.to(`article_${articleId}`).emit('newComment', comment);
      
      // Notify article author if someone else commented
      if (article.author.toString() !== req.user.userId) {
        req.io.to(`user_${article.author}`).emit('commentNotification', {
          message: `New comment on your article: ${article.title}`,
          comment,
          article: { _id: article._id, title: article.title }
        });
      }
    }

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: comment
    });

  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating comment',
      error: error.message
    });
  }
};

// @desc    Get comments for an article (with nested replies)
// @route   GET /api/comments/article/:articleId
// @access  Public
exports.getCommentsByArticle = async (req, res) => {
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

    // Get all top-level comments (parentComment is null)
    const comments = await Comment.find({ 
      article: articleId, 
      parentComment: null 
    })
      .populate('author', 'username email role')
      .sort({ createdAt: -1 });

    // For each top-level comment, get its replies recursively
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await getReplies(comment._id);
        return {
          ...comment.toObject(),
          replies
        };
      })
    );

    res.json({
      success: true,
      data: {
        articleId,
        count: commentsWithReplies.length,
        comments: commentsWithReplies
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching comments',
      error: error.message
    });
  }
};

// Helper function to recursively get replies
async function getReplies(commentId) {
  const replies = await Comment.find({ parentComment: commentId })
    .populate('author', 'username email role')
    .sort({ createdAt: 1 });

  return Promise.all(
    replies.map(async (reply) => {
      const nestedReplies = await getReplies(reply._id);
      return {
        ...reply.toObject(),
        replies: nestedReplies
      };
    })
  );
}

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (author or admin)
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const userId = req.user.userId;
    const userRole = req.user.role;
    const isAuthor = comment.author.toString() === userId;

    // Only comment author or admin can delete
    if (!isAuthor && userRole !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this comment'
      });
    }

    // Delete all nested replies first
    await deleteRepliesRecursively(comment._id);

    // Delete the comment
    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Comment and its replies deleted successfully'
    });

  } catch (error) {
    console.error('Delete comment error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting comment',
      error: error.message
    });
  }
};

// Helper function to recursively delete replies
async function deleteRepliesRecursively(commentId) {
  const replies = await Comment.find({ parentComment: commentId });
  
  for (const reply of replies) {
    await deleteRepliesRecursively(reply._id);
    await Comment.findByIdAndDelete(reply._id);
  }
}
