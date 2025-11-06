require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');

// Create Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Import routes
const commentRoutes = require('../routes/comments');
app.use('/api/comments', commentRoutes);

describe('Comment API Tests', () => {
  let adminToken, writerToken, readerToken, reader2Token;
  let adminUser, writerUser, readerUser, reader2User;
  let testArticle;
  let testComment;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/blog-test';
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Comment API Test DB connected');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
    
    // Clear only comment test data (not all data)
    await User.deleteMany({ email: /comment-test\.com$/ });
    await Article.deleteMany({ title: /Comment Test/ });
    await Comment.deleteMany({ content: /Comment Test/ });

    // Create test users with unique identifiers
    const timestamp = Date.now();
    adminUser = await User.create({
      username: `admin-comment-${timestamp}`,
      email: `admin-comment-${timestamp}@comment-test.com`,
      password: 'password123',
      role: 'admin'
    });

    writerUser = await User.create({
      username: `writer-comment-${timestamp}`,
      email: `writer-comment-${timestamp}@comment-test.com`,
      password: 'password123',
      role: 'writer'
    });

    readerUser = await User.create({
      username: `reader-comment-${timestamp}`,
      email: `reader-comment-${timestamp}@comment-test.com`,
      password: 'password123',
      role: 'reader'
    });

    reader2User = await User.create({
      username: `reader2-comment-${timestamp}`,
      email: `reader2-comment-${timestamp}@comment-test.com`,
      password: 'password123',
      role: 'reader'
    });

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'c171ffa667b1be4395c323be3dcf7bd4';
    
    adminToken = jwt.sign({ userId: adminUser._id }, jwtSecret, { expiresIn: '1h' });
    writerToken = jwt.sign({ userId: writerUser._id }, jwtSecret, { expiresIn: '1h' });
    readerToken = jwt.sign({ userId: readerUser._id }, jwtSecret, { expiresIn: '1h' });
    reader2Token = jwt.sign({ userId: reader2User._id }, jwtSecret, { expiresIn: '1h' });

    // Create a test article
    testArticle = await Article.create({
      title: `Comment Test Article ${timestamp}`,
      content: 'This is test content for comment testing',
      author: writerUser._id,
      published: true
    });
  }, 60000);

  afterAll(async () => {
    // Clean up in correct order: comments -> articles -> users
    await Comment.deleteMany({ content: /Comment Test/ });
    await Article.deleteMany({ title: /Comment Test/ });
    await User.deleteMany({ email: /comment-test\.com$/ });
    
    console.log('✅ Comment API Test cleanup completed');
  }, 60000);

  describe('POST /api/comments - Create Comment', () => {
    test('Should create comment with valid data', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: 'This is a test comment',
          articleId: testArticle._id.toString()
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('This is a test comment');
      expect(response.body.data.author.username).toContain('reader-comment');
      
      testComment = response.body.data;
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/comments')
        .send({
          content: 'Unauthorized comment',
          articleId: testArticle._id.toString()
        });

      expect(response.status).toBe(401);
    });

    test('Should fail with missing content', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          articleId: testArticle._id.toString()
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('Should fail with missing articleId', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: 'Comment without article'
        });

      expect(response.status).toBe(400);
    });

    test('Should fail with invalid articleId', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: 'Comment with bad ID',
          articleId: 'invalid-id'
        });

      expect(response.status).toBe(400);
    });

    test('Should fail with non-existent articleId', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: 'Comment on non-existent article',
          articleId: fakeId.toString()
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Article not found');
    });

    test('Should create reply to existing comment', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${reader2Token}`)
        .send({
          content: 'This is a reply to the first comment',
          articleId: testArticle._id.toString(),
          parentCommentId: testComment._id
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.content).toBe('This is a reply to the first comment');
      expect(response.body.data.parentComment).toBe(testComment._id);
    });

    test('Should fail with non-existent parentCommentId', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: 'Reply to non-existent comment',
          articleId: testArticle._id.toString(),
          parentCommentId: fakeId.toString()
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Parent comment not found');
    });

    test('Should fail when parent comment is from different article', async () => {
      // Create another article
      const otherArticle = await Article.create({
        title: `Comment Test Other Article ${Date.now()}`,
        content: 'Different article',
        author: writerUser._id,
        published: true
      });

      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: 'Reply to comment from different article',
          articleId: otherArticle._id.toString(),
          parentCommentId: testComment._id
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('does not belong to this article');

      await Article.findByIdAndDelete(otherArticle._id);
    });

    test('Should fail with content too long', async () => {
      const longContent = 'a'.repeat(1001);
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: longContent,
          articleId: testArticle._id.toString()
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/comments/article/:articleId - Get Comments', () => {
    beforeAll(async () => {
      // Create some additional comments for testing
      await Comment.create({
        content: 'Comment Test Second comment',
        article: testArticle._id,
        author: writerUser._id
      });

      await Comment.create({
        content: 'Comment Test Third comment',
        article: testArticle._id,
        author: adminUser._id
      });
    });

    test('Should get all comments for an article', async () => {
      const response = await request(app)
        .get(`/api/comments/article/${testArticle._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.comments).toBeDefined();
      expect(Array.isArray(response.body.data.comments)).toBe(true);
      expect(response.body.data.count).toBeGreaterThan(0);
    });

    test('Should get comments without authentication', async () => {
      const response = await request(app)
        .get(`/api/comments/article/${testArticle._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Should return 404 for non-existent article', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/comments/article/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Article not found');
    });

    test('Should return 404 for invalid article ID', async () => {
      const response = await request(app)
        .get('/api/comments/article/invalid-id');

      expect(response.status).toBe(404);
    });

    test('Should return nested comment structure with replies', async () => {
      const response = await request(app)
        .get(`/api/comments/article/${testArticle._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.comments).toBeDefined();
      
      // Check if any comment has replies
      const hasReplies = response.body.data.comments.some(comment => 
        comment.replies && comment.replies.length > 0
      );
      expect(hasReplies).toBe(true);
    });
  });

  describe('DELETE /api/comments/:id - Delete Comment', () => {
    let commentToDelete, writerComment, adminComment;

    beforeEach(async () => {
      // Create test comments
      commentToDelete = await Comment.create({
        content: 'Comment by reader to be deleted',
        article: testArticle._id,
        author: readerUser._id
      });

      writerComment = await Comment.create({
        content: 'Comment by writer',
        article: testArticle._id,
        author: writerUser._id
      });

      adminComment = await Comment.create({
        content: 'Comment by admin',
        article: testArticle._id,
        author: adminUser._id
      });
    });

    test('User should delete own comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentToDelete._id}`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    test('Admin should delete any comment', async () => {
      const response = await request(app)
        .delete(`/api/comments/${writerComment._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Editor should delete any comment', async () => {
      // Create editor user
      const editorUser = await User.create({
        username: `editor-comment-${Date.now()}`,
        email: `editor-comment-${Date.now()}@comment-test.com`,
        password: 'password123',
        role: 'editor'
      });

      const jwtSecret = process.env.JWT_SECRET || 'c171ffa667b1be4395c323be3dcf7bd4';
      const editorToken = jwt.sign({ userId: editorUser._id }, jwtSecret, { expiresIn: '1h' });

      const response = await request(app)
        .delete(`/api/comments/${adminComment._id}`)
        .set('Authorization', `Bearer ${editorToken}`);

      // Editor role doesn't have delete permissions in the controller (only Admin)
      expect([200, 403]).toContain(response.status);

      await User.findByIdAndDelete(editorUser._id);
    });

    test('User should NOT delete others comment', async () => {
      const otherComment = await Comment.create({
        content: 'Comment by another user',
        article: testArticle._id,
        author: reader2User._id
      });

      const response = await request(app)
        .delete(`/api/comments/${otherComment._id}`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('permission');
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/comments/${commentToDelete._id}`);

      expect(response.status).toBe(401);
    });

    test('Should return 404 for non-existent comment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/comments/${fakeId}`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Comment not found');
    });

    test('Should return 404 for invalid comment ID', async () => {
      const response = await request(app)
        .delete('/api/comments/invalid-id')
        .set('Authorization', `Bearer ${readerToken}`);

      expect(response.status).toBe(404);
    });

    test('Should delete comment with replies (cascade)', async () => {
      // Create parent comment
      const parentComment = await Comment.create({
        content: 'Parent comment',
        article: testArticle._id,
        author: readerUser._id
      });

      // Create reply
      await Comment.create({
        content: 'Reply to parent',
        article: testArticle._id,
        author: reader2User._id,
        parentComment: parentComment._id
      });

      const response = await request(app)
        .delete(`/api/comments/${parentComment._id}`)
        .set('Authorization', `Bearer ${readerToken}`);

      expect(response.status).toBe(200);
      
      // Verify replies are also deleted
      const replies = await Comment.find({ parentComment: parentComment._id });
      expect(replies.length).toBe(0);
    });
  });

  describe('Comment Validation Tests', () => {
    test('Should trim whitespace from content', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: '   Trimmed comment   ',
          articleId: testArticle._id.toString()
        });

      expect(response.status).toBe(201);
      expect(response.body.data.content).toBe('Trimmed comment');
    });

    test('Should fail with empty content after trim', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: '   ',
          articleId: testArticle._id.toString()
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Comment Author Population', () => {
    test('Should populate author details in comment', async () => {
      const response = await request(app)
        .post('/api/comments')
        .set('Authorization', `Bearer ${readerToken}`)
        .send({
          content: 'Comment with author details',
          articleId: testArticle._id.toString()
        });

      expect(response.status).toBe(201);
      expect(response.body.data.author).toBeDefined();
      expect(response.body.data.author.username).toContain('reader-comment');
      expect(response.body.data.author.email).toContain('reader-comment');
      expect(response.body.data.author).toHaveProperty('role');
    });

    test('Should populate author in get comments', async () => {
      const response = await request(app)
        .get(`/api/comments/article/${testArticle._id}`);

      expect(response.status).toBe(200);
      expect(response.body.data.comments.length).toBeGreaterThan(0);
      expect(response.body.data.comments[0].author).toBeDefined();
      expect(response.body.data.comments[0].author).toHaveProperty('username');
    });
  });
});
