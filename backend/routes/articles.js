const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const articleController = require('../controllers/articleController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { canUpdateArticle, canDeleteArticle } = require('../middleware/articlePermissions');
const { uploadLimiter } = require('../middleware/rateLimiter');

// Validation middleware
const articleValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('tags')
    .optional()
];

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get all articles with pagination
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 *   post:
 *     summary: Create new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My First Blog Post"
 *               content:
 *                 type: string
 *                 example: "This is the content of my blog post..."
 *               tags:
 *                 type: string
 *                 example: "javascript,nodejs,express"
 *                 description: Comma-separated tags
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Article created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article retrieved successfully
 *       404:
 *         description: Article not found
 *   put:
 *     summary: Update article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               tags:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Article updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Article not found
 *   delete:
 *     summary: Delete article (Admin only)
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Article not found
 */

// Public routes
router.get('/', articleController.getAllArticles);
router.get('/:id', articleController.getArticleById);

// Protected routes with role-based permissions and rate limiting
router.post('/', auth, uploadLimiter, upload.single('image'), articleValidation, articleController.createArticle);
router.put('/:id', auth, uploadLimiter, canUpdateArticle, upload.single('image'), articleValidation, articleController.updateArticle);
router.delete('/:id', auth, canDeleteArticle, articleController.deleteArticle);

module.exports = router;
