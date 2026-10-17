const mongoose = require('mongoose');

const serviceCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    default: '',
  },
  operatingHours: {
    type: String,
    default: 'Mon-Sat: 08:00 AM - 07:00 PM',
  },
  bayCapacity: {
    type: Number,
    default: 8,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ServiceCenter', serviceCenterSchema);
