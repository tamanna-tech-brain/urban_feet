const express = require('express');
const router = express.Router();
const { createInspection, getInspection } = require('../controllers/inspectionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createInspection);
router.get('/:id', protect, getInspection);

module.exports = router;
