const express = require('express');
const router = express.Router();
const cashbookController = require('../controllers/cashbookController');

router.get('/', cashbookController.getCashbook);
router.post('/', cashbookController.createCashbookEntry);
router.put('/:id', cashbookController.updateCashbookEntry);
router.delete('/:id', cashbookController.deleteCashbookEntry);

module.exports = router;
