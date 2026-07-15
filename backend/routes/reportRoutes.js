const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Laporan Laba Rugi
router.get('/profit-loss', reportController.getProfitLoss);

// Laporan Arus Kas
router.get('/cash-flow', reportController.getCashFlow);

module.exports = router;
