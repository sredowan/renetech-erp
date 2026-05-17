const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);
router.use(authorize('super_admin')); // Centralized reports only for super_admin

router.get('/comparison', reportController.getBranchComparison);
router.get('/trends', reportController.getMonthlyTrends);
router.get('/sources', reportController.getLeadSourceAnalytics);

module.exports = router;
