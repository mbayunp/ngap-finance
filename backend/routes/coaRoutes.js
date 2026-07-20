const express = require('express');
const router = express.Router();
const coaController = require('../controllers/coaController');

router.get('/', coaController.getAllCoa);
router.post('/', coaController.createCoa);
router.put('/:id', coaController.updateCoa);
router.delete('/:id', coaController.deleteCoa);

module.exports = router;
