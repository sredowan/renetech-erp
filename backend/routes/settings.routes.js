const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authMiddleware } = require('../middleware/auth.middleware');

// Apply auth middleware
router.use(authMiddleware);

// Middleware to enforce super_admin role
const superAdminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'super_admin') {
    return next();
  }
  return res.status(403).json({ error: 'Access forbidden: Super admin rights required' });
};

router.get('/', superAdminMiddleware, settingsController.getSettings);
router.put('/', superAdminMiddleware, settingsController.updateSettings);

module.exports = router;
