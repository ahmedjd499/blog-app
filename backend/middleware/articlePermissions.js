const Article = require('../models/Article');
const { UserRoles } = require('../config/roles');

// Middleware to check if user can update article
exports.canUpdateArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const userRole = req.user.role;
    const userId = req.user.userId;
    const isAuthor = article.author.toString() === userId;

    // Admin and Editor can update any article
    // Writer can only update their own articles
    if (userRole === UserRoles.ADMIN || userRole === UserRoles.EDITOR || (userRole === UserRoles.WRITER && isAuthor)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You do not have permission to update this article',
      details: {
        yourRole: userRole,
        isAuthor: isAuthor,
        required: `${UserRoles.ADMIN}, ${UserRoles.EDITOR}, or be the article author (${UserRoles.WRITER})`
      }
    });

  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking permissions'
    });
  }
};

// Middleware to check if user can delete article
exports.canDeleteArticle = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const userRole = req.user.role;

    // Only Admin can delete articles
    if (userRole === UserRoles.ADMIN) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Only Admins can delete articles',
      details: {
        yourRole: userRole,
        required: UserRoles.ADMIN
      }
    });

  } catch (error) {
    console.error('Permission check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking permissions'
    });
  }
};
