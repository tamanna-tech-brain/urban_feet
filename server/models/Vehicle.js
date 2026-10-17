const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
  },
  year: {
    type: Number,
    required: [true, 'Manufacturing year is required'],
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    uppercase: true,
    trim: true,
  },
  vin: {
    type: String,
    uppercase: true,
    trim: true,
    default: '',
  },
  mileage: {
    type: Number,
    required: [true, 'Current mileage is required'],
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
    default: 'Petrol',
  },
  color: {
    type: String,
    default: 'Silver',
  },
  lastServiceDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
