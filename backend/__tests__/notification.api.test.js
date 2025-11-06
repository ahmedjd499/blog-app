require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Article = require('../models/Article');
const Notification = require('../models/Notification');

// Create Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Import routes
const notificationRoutes = require('../routes/notifications');
app.use('/api/notifications', notificationRoutes);

describe('Notification API Tests', () => {
  let user1Token, user2Token;
  let user1, user2;
  let testArticle;
  let notification1, notification2, notification3;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/blog-test';
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Notification API Test DB connected');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
    
    // Clear only notification test data
    await User.deleteMany({ email: /notification-test\.com$/ });
    await Article.deleteMany({ title: /Notification Test/ });
    await Notification.deleteMany({ title: /Notification Test/ });

    // Create test users
    const timestamp = Date.now();
    user1 = await User.create({
      username: `user1_notif_${timestamp}`,
      email: `user1_notif_${timestamp}@notification-test.com`,
      password: 'password123',
      role: 'writer'
    });

    user2 = await User.create({
      username: `user2_notif_${timestamp}`,
      email: `user2_notif_${timestamp}@notification-test.com`,
      password: 'password123',
      role: 'reader'
    });

    // Generate tokens
    const jwtSecret = process.env.JWT_SECRET || 'c171ffa667b1be4395c323be3dcf7bd4';
    user1Token = jwt.sign({ userId: user1._id }, jwtSecret, { expiresIn: '1h' });
    user2Token = jwt.sign({ userId: user2._id }, jwtSecret, { expiresIn: '1h' });

    // Create a test article
    testArticle = await Article.create({
      title: `Notification Test Article ${timestamp}`,
      content: 'This is test content for notification testing',
      author: user1._id,
      published: true
    });

    // Create test notifications for user1
    notification1 = await Notification.create({
      recipient: user1._id,
      type: 'comment',
      title: 'Notification Test: New Comment',
      message: 'Someone commented on your article',
      article: testArticle._id,
      articleTitle: testArticle.title,
      read: false
    });

    notification2 = await Notification.create({
      recipient: user1._id,
      type: 'reply',
      title: 'Notification Test: New Reply',
      message: 'Someone replied to your comment',
      article: testArticle._id,
      articleTitle: testArticle.title,
      read: false
    });

    // Create a read notification
    notification3 = await Notification.create({
      recipient: user1._id,
      type: 'comment',
      title: 'Notification Test: Read Comment',
      message: 'Old notification',
      article: testArticle._id,
      articleTitle: testArticle.title,
      read: true
    });
  }, 60000);

  afterAll(async () => {
    // Clean up in correct order
    await Notification.deleteMany({ title: /Notification Test/ });
    await Article.deleteMany({ title: /Notification Test/ });
    await User.deleteMany({ email: /notification-test\.com$/ });
    
    console.log('✅ Notification API Test cleanup completed');
  }, 60000);

  describe('GET /api/notifications - Get Notifications', () => {
    test('Should get all notifications for authenticated user', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications).toBeDefined();
      expect(Array.isArray(response.body.data.notifications)).toBe(true);
      expect(response.body.data.notifications.length).toBe(3);
      expect(response.body.data.unreadCount).toBe(2);
    });

    test('Should get only unread notifications', async () => {
      const response = await request(app)
        .get('/api/notifications?unreadOnly=true')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.notifications.length).toBe(2);
      expect(response.body.data.notifications.every(n => !n.read)).toBe(true);
    });

    test('Should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/notifications?limit=1')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.notifications.length).toBe(1);
    });

    test('Should return empty array for user with no notifications', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.notifications).toEqual([]);
      expect(response.body.data.unreadCount).toBe(0);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(401);
    });

    test('Should sort notifications by createdAt descending', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      const notifications = response.body.data.notifications;
      
      // Check that notifications are sorted by date (newest first)
      for (let i = 0; i < notifications.length - 1; i++) {
        const date1 = new Date(notifications[i].createdAt);
        const date2 = new Date(notifications[i + 1].createdAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    });
  });

  describe('GET /api/notifications/unread-count - Get Unread Count', () => {
    test('Should get unread count for authenticated user', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
    });

    test('Should return 0 for user with no unread notifications', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.count).toBe(0);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/notifications/unread-count');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/:id/read - Mark as Read', () => {
    test('Should mark notification as read', async () => {
      const response = await request(app)
        .put(`/api/notifications/${notification1._id}/read`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.read).toBe(true);
      expect(response.body.data._id.toString()).toBe(notification1._id.toString());

      // Verify in database
      const updated = await Notification.findById(notification1._id);
      expect(updated.read).toBe(true);
    });

    test('Should fail to mark another user\'s notification', async () => {
      const response = await request(app)
        .put(`/api/notifications/${notification2._id}/read`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain('Notification not found');
    });

    test('Should return 404 for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .put(`/api/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(404);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/notifications/${notification1._id}/read`);

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/read-all - Mark All as Read', () => {
    test('Should mark all notifications as read', async () => {
      // First, create a new unread notification to ensure we have something to mark
      const newNotif = await Notification.create({
        recipient: user1._id,
        type: 'comment',
        title: 'Notification Test: Another Comment',
        message: 'Test message',
        article: testArticle._id,
        articleTitle: testArticle.title,
        read: false
      });

      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('marked as read');

      // Verify all notifications are read
      const unreadCount = await Notification.countDocuments({
        recipient: user1._id,
        read: false
      });
      expect(unreadCount).toBe(0);

      // Cleanup
      await Notification.findByIdAndDelete(newNotif._id);
    });

    test('Should work even with no unread notifications', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.modifiedCount).toBe(0);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/notifications/:id - Delete Notification', () => {
    test('Should delete own notification', async () => {
      // Create a notification to delete
      const notifToDelete = await Notification.create({
        recipient: user1._id,
        type: 'comment',
        title: 'Notification Test: To Delete',
        message: 'This will be deleted',
        article: testArticle._id,
        articleTitle: testArticle.title,
        read: false
      });

      const response = await request(app)
        .delete(`/api/notifications/${notifToDelete._id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify deletion
      const deleted = await Notification.findById(notifToDelete._id);
      expect(deleted).toBeNull();
    });

    test('Should fail to delete another user\'s notification', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${notification3._id}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(404);
    });

    test('Should return 404 for non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/notifications/${fakeId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(404);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .delete(`/api/notifications/${notification3._id}`);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/notifications - Delete All Notifications', () => {
    test('Should delete all user notifications', async () => {
      // Create some notifications
      await Notification.create({
        recipient: user2._id,
        type: 'comment',
        title: 'Notification Test: User2 Notif 1',
        message: 'Test',
        article: testArticle._id,
        articleTitle: testArticle.title,
        read: false
      });

      await Notification.create({
        recipient: user2._id,
        type: 'reply',
        title: 'Notification Test: User2 Notif 2',
        message: 'Test',
        article: testArticle._id,
        articleTitle: testArticle.title,
        read: false
      });

      const response = await request(app)
        .delete('/api/notifications')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
      expect(response.body.data.deletedCount).toBe(2);

      // Verify all deleted
      const remaining = await Notification.find({ recipient: user2._id });
      expect(remaining.length).toBe(0);
    });

    test('Should work even with no notifications', async () => {
      const response = await request(app)
        .delete('/api/notifications')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.deletedCount).toBe(0);
    });

    test('Should only delete own notifications', async () => {
      // Ensure user1 still has notifications
      const user1Notifs = await Notification.find({ recipient: user1._id });
      const initialCount = user1Notifs.length;

      // Delete user2's notifications (should be 0)
      await request(app)
        .delete('/api/notifications')
        .set('Authorization', `Bearer ${user2Token}`);

      // Check user1's notifications are unchanged
      const user1NotifsAfter = await Notification.find({ recipient: user1._id });
      expect(user1NotifsAfter.length).toBe(initialCount);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .delete('/api/notifications');

      expect(response.status).toBe(401);
    });
  });

  describe('Notification Data Validation', () => {
    test('Notifications should have required fields', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      const notifications = response.body.data.notifications;
      
      if (notifications.length > 0) {
        const notif = notifications[0];
        expect(notif).toHaveProperty('recipient');
        expect(notif).toHaveProperty('type');
        expect(notif).toHaveProperty('title');
        expect(notif).toHaveProperty('message');
        expect(notif).toHaveProperty('article');
        expect(notif).toHaveProperty('articleTitle');
        expect(notif).toHaveProperty('read');
        expect(notif).toHaveProperty('createdAt');
      }
    });

    test('Notification type should be valid enum', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      const notifications = response.body.data.notifications;
      
      notifications.forEach(notif => {
        expect(['comment', 'reply']).toContain(notif.type);
      });
    });
  });
});
