const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

// GET all sales
router.get('/', salesController.getSales);

// POST create new sale
router.post('/', salesController.createSale);

// DELETE sale
router.delete('/:id', salesController.deleteSale);

module.exports = router;
