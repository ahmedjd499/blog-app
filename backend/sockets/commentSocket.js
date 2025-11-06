const jwt = require('jsonwebtoken');
const Comment = require('../models/Comment');

// Initialize Socket.io handlers
const initializeSocketHandlers = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Invalid or expired token'));
    }
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (Socket: ${socket.id})`);

    // Join article room
    socket.on('joinArticle', (articleId) => {
      socket.join(`article_${articleId}`);
      console.log(`User ${socket.userId} joined article room: ${articleId}`);
      
      // Notify others in the room
      socket.to(`article_${articleId}`).emit('userJoined', {
        userId: socket.userId,
        articleId
      });
    });

    // Leave article room
    socket.on('leaveArticle', (articleId) => {
      socket.leave(`article_${articleId}`);
      console.log(`User ${socket.userId} left article room: ${articleId}`);
      
      // Notify others in the room
      socket.to(`article_${articleId}`).emit('userLeft', {
        userId: socket.userId,
        articleId
      });
    });

    // Handle new comment (emitted from controller)
    // This is handled in the comment controller

    // Handle typing indicator
    socket.on('typing', ({ articleId, username }) => {
      socket.to(`article_${articleId}`).emit('userTyping', {
        username,
        articleId
      });
    });

    socket.on('stopTyping', ({ articleId, username }) => {
      socket.to(`article_${articleId}`).emit('userStoppedTyping', {
        username,
        articleId
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId} (Socket: ${socket.id})`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  return io;
};

// Helper function to emit new comment to article room
const emitNewComment = (io, articleId, comment) => {
  io.to(`article_${articleId}`).emit('newComment', comment);
};

// Helper function to emit comment deleted to article room
const emitCommentDeleted = (io, articleId, commentId) => {
  io.to(`article_${articleId}`).emit('commentDeleted', { commentId, articleId });
};

module.exports = {
  initializeSocketHandlers,
  emitNewComment,
  emitCommentDeleted
};
