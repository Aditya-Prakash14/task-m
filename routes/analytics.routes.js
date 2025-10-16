const express = require('express');
const analyticsController = require('../controllers/analytics.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/dashboard', analyticsController.getDashboardAnalytics);
router.get('/productivity', analyticsController.getProductivityAnalytics);

module.exports = router;
