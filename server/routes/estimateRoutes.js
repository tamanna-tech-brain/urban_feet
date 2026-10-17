const express = require('express');
const router = express.Router();
const { createEstimate, customerDecision, getEstimate } = require('../controllers/estimateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createEstimate);
router.get('/:id', protect, getEstimate);
router.post('/:id/decision', protect, customerDecision);

module.exports = router;
