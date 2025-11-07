const Article = require('../models/Article');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// @desc    Create new article
// @route   POST /api/articles
// @access  Private (authenticated users)
exports.createArticle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { title, content, tags } = req.body;
    
    // Parse tags if sent as string
    let parsedTags = [];
    if (tags) {
      parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    }

    const articleData = {
      title,
      content,
      tags: parsedTags,
      author: req.user.userId,
      image: req.file ? req.file.filename : null
    };

    const article = await Article.create(articleData);
    await article.populate('author', 'username email role');

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: article
    });

  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating article',
      error: error.message
    });
  }
};

// @desc    Get all articles with pagination
// @route   GET /api/articles
// @access  Public
exports.getAllArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const tag = req.query.tag;
    const search = req.query.search;

    // Build query
    let matchQuery = {};
    if (tag) {
      matchQuery.tags = tag;
    }
    if (search) {
      matchQuery.$text = { $search: search };
    }

    const Comment = require('../models/Comment');
    const Like = require('../models/Like');

    // Use aggregation to include comments count and likes count
    const articlesWithComments = await Article.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'article',
          as: 'comments'
        }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'article',
          as: 'likes'
        }
      },
      {
        $addFields: {
          commentsCount: { $size: '$comments' },
          likesCount: { $size: '$likes' }
        }
      },
      {
        $project: {
          comments: 0, // Remove comments array, keep only count
          likes: 0 // Remove likes array, keep only count
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $project: {
          title: 1,
          content: 1,
          image: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
          commentsCount: 1,
          likesCount: 1,
          'author._id': 1,
          'author.username': 1,
          'author.email': 1,
          'author.role': 1
        }
      }
    ]);

    const total = await Article.countDocuments(matchQuery);

    res.json({
      success: true,
      data: {
        articles: articlesWithComments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching articles',
      error: error.message
    });
  }
};

// @desc    Get single article by ID
// @route   GET /api/articles/:id
// @access  Public
exports.getArticleById = async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    const Like = require('../models/Like');
    const mongoose = require('mongoose');

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Use aggregation to include comments count and likes count
    const articleWithComments = await Article.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(req.params.id) } },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'article',
          as: 'comments'
        }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'article',
          as: 'likes'
        }
      },
      {
        $addFields: {
          commentsCount: { $size: '$comments' },
          likesCount: { $size: '$likes' }
        }
      },
      {
        $project: {
          comments: 0, // Remove comments array, keep only count
          likes: 0 // Remove likes array, keep only count
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: '$author' },
      {
        $project: {
          title: 1,
          content: 1,
          image: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
          commentsCount: 1,
          likesCount: 1,
          'author._id': 1,
          'author.username': 1,
          'author.email': 1,
          'author.role': 1
        }
      }
    ]);

    if (!articleWithComments || articleWithComments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.json({
      success: true,
      data: articleWithComments[0]
    });

  } catch (error) {
    console.error('Get article error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching article',
      error: error.message
    });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (with permissions check)
exports.updateArticle = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const { title, content, tags } = req.body;

    // Update fields
    if (title) article.title = title;
    if (content) article.content = content;
    if (tags) {
      article.tags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags;
    }

    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (article.image) {
        const oldImagePath = path.join(__dirname, '../uploads', article.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      article.image = req.file.filename;
    }

    await article.save();
    await article.populate('author', 'username email role');

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: article
    });

  } catch (error) {
    console.error('Update article error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating article',
      error: error.message
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Admin only)
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Delete associated image
    if (article.image) {
      const imagePath = path.join(__dirname, '../uploads', article.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Article.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Delete article error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting article',
      error: error.message
    });
  }
};
