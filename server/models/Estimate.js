const mongoose = require('mongoose');

const estimateItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['part', 'labor', 'diagnostic', 'fee'],
    default: 'part',
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
    default: 0,
  },
});

const estimateSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true,
  },
  preparedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [estimateItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0,
  },
  taxRate: {
    type: Number,
    default: 8.5, // 8.5% default tax
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
  estimatedHours: {
    type: Number,
    default: 2.5,
  },
  advisorNotes: {
    type: String,
    default: '',
  },
  customerDecision: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  customerNotes: {
    type: String,
    default: '',
  },
  customerSignature: {
    type: String,
    default: '',
  },
  decisionTimestamp: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Estimate', estimateSchema);
