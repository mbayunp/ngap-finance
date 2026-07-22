const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Laporan Laba Rugi
router.get('/profit-loss', reportController.getProfitLoss);

// Laporan Arus Kas
router.get('/cash-flow', reportController.getCashFlow);

// Laporan Detail Buku Kas & Saldo Berjalan
router.get('/cash-detail', reportController.getCashDetailReport);

module.exports = router;
