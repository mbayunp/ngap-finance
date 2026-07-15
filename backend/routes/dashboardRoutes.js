const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Route: /api/dashboard/summary
router.get('/summary', dashboardController.getDashboardSummary);

// Route: /api/dashboard/channel-analysis
router.get('/channel-analysis', dashboardController.getChannelAnalysis);

// Route: /api/dashboard/bep-analysis
router.get('/bep-analysis', dashboardController.getBepAnalysis);

// Route: /api/dashboard/recent-activities
router.get('/recent-activities', dashboardController.getRecentActivities);

module.exports = router;
