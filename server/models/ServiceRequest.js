const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    default: '',
  },
  performedBy: {
    type: String,
    default: 'System',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const serviceRequestSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  serviceCenter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceCenter',
    required: true,
  },
  serviceType: {
    type: String,
    enum: [
      'Scheduled Periodic Maintenance',
      'Brake System Overhaul',
      'Engine Diagnostics & Tune-up',
      'AC & Climate Control',
      'Suspension & Steering Service',
      'Full Fleet Safety Inspection',
    ],
    default: 'Scheduled Periodic Maintenance',
  },
  primaryConcerns: {
    type: String,
    required: [true, 'Please state vehicle symptoms or requested items'],
  },
  preferredDate: {
    type: Date,
    required: true,
  },
  currentStage: {
    type: String,
    enum: [
      'Request Intake',
      'Inspection & Estimate',
      'Customer Approval',
      'Service Execution',
      'Quality Check & Pickup',
      'Resolved',
    ],
    default: 'Request Intake',
  },
  status: {
    type: String,
    enum: [
      'NEW',
      'INSPECTION_PENDING',
      'ESTIMATED',
      'AWAITING_APPROVAL',
      'APPROVED',
      'REJECTED',
      'ASSIGNED',
      'IN_PROGRESS',
      'QUALITY_CHECK',
      'READY_FOR_PICKUP',
      'COMPLETED',
      'CANCELLED',
    ],
    default: 'NEW',
  },
  assignedAdvisor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assignedTechnician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  slaHours: {
    type: Number,
    default: 24, // 24-hour turnaround target
  },
  slaDeadline: {
    type: Date,
  },
  odometerAtIntake: {
    type: Number,
    default: 0,
  },
  timeline: [timelineEntrySchema],
  inspection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Inspection',
    default: null,
  },
  estimate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estimate',
    default: null,
  },
  videoConsultation: {
    active: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['none', 'scheduled', 'live', 'completed'],
      default: 'none',
    },
    meetingUrl: {
      type: String,
      default: '',
    },
    roomName: {
      type: String,
      default: '',
    },
    pin: {
      type: String,
      default: '',
    },
    agenda: {
      type: String,
      default: '',
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    hostName: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    endedAt: {
      type: Date,
      default: null,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

serviceRequestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (!this.slaDeadline) {
    this.slaDeadline = new Date(Date.now() + (this.slaHours || 24) * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
