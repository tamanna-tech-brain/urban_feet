const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    default: null,
  },
  caseId: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: [
      'request_created',
      'inspection_completed',
      'estimate_ready',
      'approval_received',
      'rejection_received',
      'technician_assigned',
      'service_in_progress',
      'quality_check_passed',
      'ready_for_pickup',
      'service_completed',
      'general',
    ],
    default: 'general',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
