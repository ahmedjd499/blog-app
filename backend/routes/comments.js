const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const commentController = require('../controllers/commentController');
const auth = require('../middleware/auth');

// Validation middleware
const commentValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('articleId')
    .notEmpty()
    .withMessage('Article ID is required')
    .isMongoId()
    .withMessage('Invalid article ID'),
  body('parentCommentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID')
];

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Create new comment or reply
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - articleId
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Great article!"
 *               articleId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               parentCommentId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *                 description: Optional - for replying to a comment
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Article or parent comment not found
 */

/**
 * @swagger
 * /api/comments/article/{articleId}:
 *   get:
 *     summary: Get all comments for an article (nested structure)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *       404:
 *         description: Article not found
 */

/**
 * @swagger
 * /api/comments/{id}:
 *   delete:
 *     summary: Delete comment (author or admin)
 *     tags: [Comments]
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
 *         description: Comment deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Comment not found
 */

// Routes
router.post('/', auth, commentValidation, commentController.createComment);
router.get('/article/:articleId', commentController.getCommentsByArticle);
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;
