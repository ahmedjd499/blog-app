require('dotenv').config();

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Create Express app for testing
const express = require('express');
const app = express();
app.use(express.json());

// Import routes
const authRoutes = require('../routes/auth');
app.use('/api/auth', authRoutes);

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    const mongoUri =  process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/blog-test';
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 45000,
      });
      console.log('✅ Auth API Test DB connected');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
    
    // Clear only auth test data
    await User.deleteMany({ email: /auth-test\.com$/ });
  }, 60000);

  afterAll(async () => {
    // Clean up only this test's data
    await User.deleteMany({ email: /auth-test\.com$/ });
    console.log('✅ Auth API Test cleanup completed');
  }, 60000);

  describe('POST /api/auth/register - User Registration', () => {
    test('Should register new user with valid data', async () => {
      const timestamp = Date.now();
      const testUserEmail = `test-${timestamp}@auth-test.com`;
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `testuser_${timestamp}`,
          email: testUserEmail,
          password: 'password123',
          role: 'reader'
        });

      if (response.status !== 201) {
        console.log('Registration failed:', response.body);
      }

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.username).toBe(`testuser_${timestamp}`);
      expect(response.body.data.user.email).toBe(testUserEmail);
    });

    test('Should fail with duplicate email', async () => {
      const timestamp = Date.now();
      const duplicateEmail = `duplicate-${timestamp}@auth-test.com`;
      
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: `user1_${timestamp}`,
          email: duplicateEmail,
          password: 'password123'
        });
      
      // Try duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `user2_${timestamp}`,
          email: duplicateEmail,
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Email already registered');
    });

    test('Should fail with duplicate username', async () => {
      const timestamp = Date.now();
      const duplicateUsername = `dupuser_${timestamp}`;
      
      // First registration
      await request(app)
        .post('/api/auth/register')
        .send({
          username: duplicateUsername,
          email: `user1_dup_${timestamp}@auth-test.com`,
          password: 'password123'
        });
      
      // Try duplicate username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: duplicateUsername,
          email: `user2_dup_${timestamp}@auth-test.com`,
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Username already taken');
    });

    test('Should fail with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'incomplete'
          // Missing email and password
        });

      expect(response.status).toBe(400);
    });

    test('Should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `newuser_${Date.now()}`,
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
    });

    test('Should fail with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `newuser2_${Date.now()}`,
          email: `new-${Date.now()}@auth-test.com`,
          password: '123' // Too short
        });

      expect(response.status).toBe(400);
    });

    test('Should default to reader role if not specified', async () => {
      const timestamp = Date.now();
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: `defaultrole_${timestamp}`,
          email: `default-${timestamp}@auth-test.com`,
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.role).toBe('reader');
    });
  });

  describe('POST /api/auth/login - User Login', () => {
    let loginUserEmail;
    
    beforeAll(async () => {
      const timestamp2 = Date.now();
      loginUserEmail = `login-${timestamp2}@auth-test.com`;
      
      // Create a user specifically for login tests
      await request(app)
        .post('/api/auth/register')
        .send({
          username: `loginuser_${timestamp2}`,
          email: loginUserEmail,
          password: 'password123',
          role: 'reader'
        });
    });
    
    test('Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUserEmail,
          password: 'password123'
        });

      if (response.status !== 200) {
        console.log('Login failed for email:', loginUserEmail);
        console.log('Response:', response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data.user.email).toBe(loginUserEmail);
    });

    test('Should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUserEmail,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: `nonexistent-${Date.now()}@auth-test.com`,
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    test('Should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: loginUserEmail
          // Missing password
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me - Get User Profile', () => {
    let authToken;
    let testEmail;

    beforeAll(async () => {
      const timestamp3 = Date.now();
      testEmail = `profile-${timestamp3}@auth-test.com`;
      
      // Create a user for profile tests
      await request(app)
        .post('/api/auth/register')
        .send({
          username: `profileuser_${timestamp3}`,
          email: testEmail,
          password: 'password123'
        });
      
      const user = await User.findOne({ email: testEmail });
      const jwtSecret = process.env.JWT_SECRET || 'c171ffa667b1be4395c323be3dcf7bd4';
      authToken = jwt.sign(
        { userId: user._id },
        jwtSecret,
        { expiresIn: '1h' }
      );
    });

    test('Should get profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testEmail);
    });

    test('Should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    test('Should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/logout - Logout', () => {
    let authToken;
    let logoutUserEmail;

    beforeAll(async () => {
      const timestamp4 = Date.now();
      logoutUserEmail = `logout-${timestamp4}@auth-test.com`;
      
      // Create a user specifically for logout tests
      await request(app)
        .post('/api/auth/register')
        .send({
          username: `logoutuser_${timestamp4}`,
          email: logoutUserEmail,
          password: 'password123',
          role: 'reader'
        });
      
      const user = await User.findOne({ email: logoutUserEmail });
      const jwtSecret = process.env.JWT_SECRET || 'c171ffa667b1be4395c323be3dcf7bd4';
      authToken = jwt.sign(
        { userId: user._id },
        jwtSecret,
        { expiresIn: '1h' }
      );
    });

    test('Should logout with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
    });
  });
});
