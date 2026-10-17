const express = require('express');
const router = express.Router();
const { getVehicles, getVehicleById, createVehicle, updateVehicle } = require('../controllers/vehicleController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getVehicles)
  .post(protect, createVehicle);

router.route('/:id')
  .get(protect, getVehicleById)
  .put(protect, updateVehicle);

module.exports = router;
