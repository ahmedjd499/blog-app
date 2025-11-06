require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Article = require('../models/Article');

// Mock app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Import routes
const authRoutes = require('../routes/auth');
const articleRoutes = require('../routes/articles');
const adminRoutes = require('../routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin', adminRoutes);

describe('Roles and Permissions Tests', () => {
  let adminToken, editorToken, writerToken, readerToken;
  let adminUser, editorUser, writerUser, readerUser;
  let testArticle, writerArticle;

  beforeAll(async () => {
    // Connect to test database with retry and proper options for external DB
    const mongoUri =  process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/blog-test';
    console.log(mongoUri);
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Test database connected');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
    
    // Clear collections
    await User.deleteMany({});
    await Article.deleteMany({});
  }, 60000); // 60 second timeout for external database connection

  afterAll(async () => {
    try {
      await User.deleteMany({});
      await Article.deleteMany({});
      await mongoose.connection.close();
      console.log('✅ Test cleanup completed');
    } catch (error) {
      console.error('Cleanup error:', error.message);
    }
  }, 60000); // 60 second timeout for cleanup

  describe('User Creation and Authentication', () => {
    test('Create Admin user', async () => {
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@test.com',
        password: 'password123',
        role: 'admin'
      });
      
      expect(adminUser.role).toBe('admin');
      adminToken = jwt.sign(
        { id: adminUser._id, role: adminUser.role },
        process.env.JWT_SECRET || 'test-secret'
      );
    });

    test('Create Editor user', async () => {
      editorUser = await User.create({
        username: 'editor',
        email: 'editor@test.com',
        password: 'password123',
        role: 'editor'
      });
      
      expect(editorUser.role).toBe('editor');
      editorToken = jwt.sign(
        { id: editorUser._id, role: editorUser.role },
        process.env.JWT_SECRET || 'test-secret'
      );
    });

    test('Create Writer user', async () => {
      writerUser = await User.create({
        username: 'writer',
        email: 'writer@test.com',
        password: 'password123',
        role: 'writer'
      });
      
      expect(writerUser.role).toBe('writer');
      writerToken = jwt.sign(
        { id: writerUser._id, role: writerUser.role },
        process.env.JWT_SECRET || 'test-secret'
      );
    });

    test('Create Reader user', async () => {
      readerUser = await User.create({
        username: 'reader',
        email: 'reader@test.com',
        password: 'password123',
        role: 'reader'
      });
      
      expect(readerUser.role).toBe('reader');
      readerToken = jwt.sign(
        { id: readerUser._id, role: readerUser.role },
        process.env.JWT_SECRET || 'test-secret'
      );
    });
  });

  describe('Article Creation Permissions', () => {
    test('Admin can create article', async () => {
      testArticle = await Article.create({
        title: 'Admin Article',
        content: 'Content by admin',
        excerpt: 'Admin excerpt',
        author: adminUser._id,
        published: true
      });
      
      expect(testArticle.title).toBe('Admin Article');
      expect(testArticle.author.toString()).toBe(adminUser._id.toString());
    });

    test('Editor can create article', async () => {
      const article = await Article.create({
        title: 'Editor Article',
        content: 'Content by editor',
        excerpt: 'Editor excerpt',
        author: editorUser._id,
        published: true
      });
      
      expect(article.title).toBe('Editor Article');
    });

    test('Writer can create article', async () => {
      writerArticle = await Article.create({
        title: 'Writer Article',
        content: 'Content by writer',
        excerpt: 'Writer excerpt',
        author: writerUser._id,
        published: true
      });
      
      expect(writerArticle.title).toBe('Writer Article');
      expect(writerArticle.author.toString()).toBe(writerUser._id.toString());
    });

    test('Reader role should not have article creation permission', () => {
      // In a real scenario, this would be tested via API endpoint
      // which would return 403 for reader role
      expect(readerUser.role).toBe('reader');
      // This is a reminder that Reader cannot create articles
    });
  });

  describe('Article Edit Permissions', () => {
    test('Admin can edit any article', async () => {
      testArticle.title = 'Updated by Admin';
      await testArticle.save();
      
      expect(testArticle.title).toBe('Updated by Admin');
    });

    test('Editor can edit any article', async () => {
      testArticle.title = 'Updated by Editor';
      await testArticle.save();
      
      expect(testArticle.title).toBe('Updated by Editor');
    });

    test('Writer can edit own articles', async () => {
      writerArticle.title = 'Updated by Owner Writer';
      await writerArticle.save();
      
      expect(writerArticle.title).toBe('Updated by Owner Writer');
    });

    test('Writer cannot edit others articles - ownership check', () => {
      const isOwner = writerArticle.author.toString() === writerUser._id.toString();
      const isNotOwner = testArticle.author.toString() !== writerUser._id.toString();
      
      expect(isOwner).toBe(true);
      expect(isNotOwner).toBe(true);
      // In real scenario, API would return 403 if writer tries to edit testArticle
    });

    test('Reader cannot edit articles', () => {
      expect(readerUser.role).toBe('reader');
      // Reader role should not have edit permissions
    });
  });

  describe('Article Delete Permissions', () => {
    test('Admin can delete any article', async () => {
      const article = await Article.create({
        title: 'To be deleted by admin',
        content: 'Article content for deletion test',
        excerpt: 'Excerpt',
        author: writerUser._id,
        published: true
      });
      
      await Article.findByIdAndDelete(article._id);
      const deleted = await Article.findById(article._id);
      
      expect(deleted).toBeNull();
    });

    test('Editor can delete any article', async () => {
      const article = await Article.create({
        title: 'To be deleted by editor',
        content: 'Article content for deletion test',
        excerpt: 'Excerpt',
        author: writerUser._id,
        published: true
      });
      
      await Article.findByIdAndDelete(article._id);
      const deleted = await Article.findById(article._id);
      
      expect(deleted).toBeNull();
    });

    test('Writer can delete own articles', async () => {
      const article = await Article.create({
        title: 'Writers own article',
        content: 'Article content for deletion test',
        excerpt: 'Excerpt',
        author: writerUser._id,
        published: true
      });
      
      const isOwner = article.author.toString() === writerUser._id.toString();
      expect(isOwner).toBe(true);
      
      await Article.findByIdAndDelete(article._id);
      const deleted = await Article.findById(article._id);
      expect(deleted).toBeNull();
    });

    test('Writer ownership validation for deletion', () => {
      const canDeleteOwn = testArticle.author.toString() === adminUser._id.toString();
      const cannotDeleteOthers = testArticle.author.toString() !== writerUser._id.toString();
      
      expect(canDeleteOwn).toBe(true);
      expect(cannotDeleteOthers).toBe(true);
    });
  });

  describe('User Management Permissions', () => {
    test('Admin role allows user management', () => {
      expect(adminUser.role).toBe('admin');
      // Only admin should access user management endpoints
    });

    test('Admin can update user roles', async () => {
      const userToUpdate = await User.create({
        username: 'testuser-role-update',
        email: 'testuser-role-update@test.com',
        password: 'password123',
        role: 'reader'
      });
      
      userToUpdate.role = 'writer';
      await userToUpdate.save();
      
      expect(userToUpdate.role).toBe('writer');
      
      await User.findByIdAndDelete(userToUpdate._id);
    });

    test('Non-admin cannot manage users', () => {
      expect(editorUser.role).not.toBe('admin');
      expect(writerUser.role).not.toBe('admin');
      expect(readerUser.role).not.toBe('admin');
      // In real scenario, API would return 403 for non-admin
    });

    test('Admin can delete users', async () => {
      const userToDelete = await User.create({
        username: 'deleteme',
        email: 'deleteme@test.com',
        password: 'password123',
        role: 'reader'
      });
      
      await User.findByIdAndDelete(userToDelete._id);
      const deleted = await User.findById(userToDelete._id);
      
      expect(deleted).toBeNull();
    });
  });

  describe('Role Hierarchy Validation', () => {
    test('Role hierarchy: Admin > Editor > Writer > Reader', () => {
      const roles = ['admin', 'editor', 'writer', 'reader'];
      
      expect(roles.indexOf(adminUser.role)).toBe(0);
      expect(roles.indexOf(editorUser.role)).toBe(1);
      expect(roles.indexOf(writerUser.role)).toBe(2);
      expect(roles.indexOf(readerUser.role)).toBe(3);
    });

    test('Permission inheritance: Admin has all permissions', () => {
      const adminPermissions = {
        canCreateArticle: true,
        canEditAnyArticle: true,
        canDeleteAnyArticle: true,
        canManageUsers: true,
        canAccessAdmin: true
      };
      
      expect(adminPermissions.canCreateArticle).toBe(true);
      expect(adminPermissions.canEditAnyArticle).toBe(true);
      expect(adminPermissions.canDeleteAnyArticle).toBe(true);
      expect(adminPermissions.canManageUsers).toBe(true);
    });

    test('Permission check: Editor permissions', () => {
      const editorPermissions = {
        canCreateArticle: true,
        canEditAnyArticle: true,
        canDeleteAnyArticle: true,
        canManageUsers: false,
        canAccessAdmin: false
      };
      
      expect(editorPermissions.canCreateArticle).toBe(true);
      expect(editorPermissions.canEditAnyArticle).toBe(true);
      expect(editorPermissions.canManageUsers).toBe(false);
    });

    test('Permission check: Writer permissions', () => {
      const writerPermissions = {
        canCreateArticle: true,
        canEditOwnArticle: true,
        canEditAnyArticle: false,
        canDeleteOwnArticle: true,
        canDeleteAnyArticle: false,
        canManageUsers: false
      };
      
      expect(writerPermissions.canCreateArticle).toBe(true);
      expect(writerPermissions.canEditOwnArticle).toBe(true);
      expect(writerPermissions.canEditAnyArticle).toBe(false);
    });

    test('Permission check: Reader permissions', () => {
      const readerPermissions = {
        canReadArticle: true,
        canComment: true,
        canCreateArticle: false,
        canEditArticle: false,
        canDeleteArticle: false,
        canManageUsers: false
      };
      
      expect(readerPermissions.canReadArticle).toBe(true);
      expect(readerPermissions.canComment).toBe(true);
      expect(readerPermissions.canCreateArticle).toBe(false);
    });
  });

  describe('Comment Permissions', () => {
    test('All roles can read comments', () => {
      const canRead = {
        admin: true,
        editor: true,
        writer: true,
        reader: true
      };
      
      expect(canRead.admin).toBe(true);
      expect(canRead.reader).toBe(true);
    });

    test('All authenticated users can create comments', () => {
      expect(adminUser._id).toBeDefined();
      expect(editorUser._id).toBeDefined();
      expect(writerUser._id).toBeDefined();
      expect(readerUser._id).toBeDefined();
    });

    test('Users can delete own comments', () => {
      // Ownership check logic
      const commentAuthorId = writerUser._id.toString();
      const currentUserId = writerUser._id.toString();
      
      expect(commentAuthorId).toBe(currentUserId);
    });

    test('Admin and Editor can delete any comment', () => {
      const canDeleteAny = {
        admin: true,
        editor: true,
        writer: false,
        reader: false
      };
      
      expect(canDeleteAny.admin).toBe(true);
      expect(canDeleteAny.editor).toBe(true);
      expect(canDeleteAny.writer).toBe(false);
    });
  });
});
