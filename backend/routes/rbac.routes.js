const express = require('express');
const router = express.Router();
const rbacController = require('../controllers/rbac.controller');
const { authMiddleware, roleMiddleware } = require('../middleware/auth.middleware');

// Any authenticated user can read (needed to build their sidebar)
router.get('/config', authMiddleware, rbacController.getConfig);

// Only super_admin / branch_admin can write
router.put('/config', authMiddleware, roleMiddleware(['super_admin', 'branch_admin']), rbacController.saveConfig);

module.exports = router;
