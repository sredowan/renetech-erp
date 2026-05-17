const express = require('express');
const router = express.Router();
const pteController = require('../controllers/pte.controller');
const { authMiddleware } = require('../middleware/auth.middleware');
const { branchMiddleware } = require('../middleware/branch.middleware');
const { deviceMiddleware } = require('../middleware/device.middleware');

router.use(authMiddleware);
router.use(branchMiddleware);
router.use(deviceMiddleware);

router.get('/tasks', pteController.getTasks);
router.post('/attempts', pteController.createAttempt);
router.get('/performance', pteController.getPerformance);
router.get('/performance/branch', pteController.getBranchPerformance);

module.exports = router;
