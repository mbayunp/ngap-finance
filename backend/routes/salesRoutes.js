const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// GET all sales
router.get('/', salesController.getSales);

// POST create new sale
router.post('/', salesController.createSale);

// Bulk endpoints
router.put('/bulk-settle', salesController.bulkSettleSales);
router.post('/bulk-delete', salesController.bulkDeleteSales);

// DELETE sale
router.delete('/:id', salesController.deleteSale);

// PUT settle sale
router.put('/:id/settle', salesController.settleSale);

module.exports = router;
