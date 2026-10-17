const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  item: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pass', 'warning', 'fail'],
    default: 'pass',
  },
  notes: {
    type: String,
    default: '',
  },
});

const inspectionSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true,
  },
  inspector: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  odometerReading: {
    type: Number,
    required: true,
  },
  fuelLevel: {
    type: String,
    enum: ['Empty', '1/4', '1/2', '3/4', 'Full'],
    default: '1/2',
  },
  checklist: [checklistItemSchema],
  advisorRemarks: {
    type: String,
    default: '',
  },
  recommendImmediateRepair: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Inspection', inspectionSchema);
