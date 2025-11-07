const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const likeController = require('../controllers/likeController');
const auth = require('../middleware/auth');

// Validation middleware
const likeValidation = [
  body('articleId')
    .notEmpty()
    .withMessage('Article ID is required')
    .isMongoId()
    .withMessage('Invalid article ID')
];

/**
 * @swagger
 * /api/likes:
 *   post:
 *     summary: Toggle like on an article (like or unlike)
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - articleId
 *             properties:
 *               articleId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Article unliked successfully
 *       201:
 *         description: Article liked successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */

/**
 * @swagger
 * /api/likes/article/{articleId}:
 *   get:
 *     summary: Get all likes for an article
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Likes retrieved successfully
 *       404:
 *         description: Article not found
 */

/**
 * @swagger
 * /api/likes/article/{articleId}/check:
 *   get:
 *     summary: Check if current user liked an article
 *     tags: [Likes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Like status retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article not found
 */

/**
 * @swagger
 * /api/likes/user/{userId}:
 *   get:
 *     summary: Get all articles liked by a user
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User likes retrieved successfully
 *       404:
 *         description: User not found
 */

// Routes
router.post('/', auth, likeValidation, likeController.toggleLike);
router.get('/article/:articleId', likeController.getLikesByArticle);
router.get('/article/:articleId/check', auth, likeController.checkUserLike);
router.get('/user/:userId', likeController.getLikesByUser);

module.exports = router;
