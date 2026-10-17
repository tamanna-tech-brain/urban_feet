const store = require('../utils/dataStore');

// Helper to generate next Case ID
const generateCaseId = () => {
  const year = new Date().getFullYear();
  const count = store.serviceRequests.length + 1;
  return `SR-${year}-${String(count).padStart(3, '0')}`;
};

// @desc Get all service requests (role-scoped)
// @route GET /api/services
exports.getServiceRequests = async (req, res) => {
  try {
    let requests = [...store.serviceRequests];

    if (req.user) {
      if (req.user.role === 'customer') {
        requests = requests.filter(r => String(r.customer) === String(req.user._id));
      } else if (req.user.role === 'technician') {
        requests = requests.filter(r => String(r.assignedTechnician) === String(req.user._id));
      }
    }

    const populated = requests.map(r => store.populateRequest(r));
    res.json({ success: true, count: populated.length, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get single service request / case
// @route GET /api/services/:id
exports.getServiceRequestById = async (req, res) => {
  try {
    const raw = store.serviceRequests.find(
      r => String(r._id) === String(req.params.id) || r.caseId === req.params.id
    );

    if (!raw) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const populated = store.populateRequest(raw);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Create new vehicle service request (Customer intake)
// @route POST /api/services
exports.createServiceRequest = async (req, res) => {
  try {
    const { vehicleId, serviceCenterId, serviceType, primaryConcerns, preferredDate, odometerAtIntake } = req.body;

    if (!vehicleId || !serviceCenterId || !primaryConcerns) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vehicle, service center, and primary vehicle concerns',
      });
    }

    const caseId = generateCaseId();
    const slaHours = 24;
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const newRequest = {
      _id: 'req_' + Date.now(),
      caseId,
      customer: req.user._id,
      vehicle: vehicleId,
      serviceCenter: serviceCenterId,
      serviceType: serviceType || 'Scheduled Periodic Maintenance',
      primaryConcerns,
      preferredDate: preferredDate ? new Date(preferredDate) : new Date(Date.now() + 86400000),
      currentStage: 'Request Intake',
      status: 'NEW',
      assignedAdvisor: null,
      assignedTechnician: null,
      slaHours,
      slaDeadline,
      odometerAtIntake: Number(odometerAtIntake) || 0,
      inspection: null,
      estimate: null,
      timeline: [
        {
          stage: 'Request Intake',
          status: 'NEW',
          action: 'Service request created by customer',
          notes: primaryConcerns,
          performedBy: req.user.name,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    store.serviceRequests.unshift(newRequest);

    // Automated notification to service advisors
    const newNotif = {
      _id: 'notif_' + Date.now(),
      recipient: 'usr_adv_01', // Default lead advisor
      serviceRequest: newRequest._id,
      caseId: newRequest.caseId,
      title: 'New Service Request Logged',
      message: `New case ${caseId} logged for ${newRequest.serviceType}. Inspection scheduling needed.`,
      type: 'request_created',
      isRead: false,
      createdAt: new Date(),
    };
    store.notifications.unshift(newNotif);

    store.saveToFile();

    const populated = store.populateRequest(newRequest);
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update case stage and status (Case Management transitions)
// @route PATCH /api/services/:id/stage
exports.updateStageStatus = async (req, res) => {
  try {
    const { stage, status, action, notes } = req.body;
    const idx = store.serviceRequests.findIndex(
      r => String(r._id) === String(req.params.id) || r.caseId === req.params.id
    );

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const current = store.serviceRequests[idx];
    if (stage) current.currentStage = stage;
    if (status) current.status = status;
    current.updatedAt = new Date();

    current.timeline.push({
      stage: stage || current.currentStage,
      status: status || current.status,
      action: action || `Stage transitioned to ${stage || current.currentStage}`,
      notes: notes || '',
      performedBy: req.user?.name || 'Staff Advisor',
      timestamp: new Date(),
    });

    store.saveToFile();

    const populated = store.populateRequest(current);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Assign Technician to Case (Advisor or Admin)
// @route POST /api/services/:id/assign-technician
exports.assignTechnician = async (req, res) => {
  try {
    const { technicianId, notes } = req.body;
    const idx = store.serviceRequests.findIndex(
      r => String(r._id) === String(req.params.id) || r.caseId === req.params.id
    );

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const techUser = store.users.find(u => String(u._id) === String(technicianId));
    if (!techUser) {
      return res.status(404).json({ success: false, message: 'Technician not found' });
    }

    const reqItem = store.serviceRequests[idx];
    reqItem.assignedTechnician = technicianId;
    reqItem.currentStage = 'Service Execution';
    reqItem.status = 'ASSIGNED';
    reqItem.updatedAt = new Date();

    reqItem.timeline.push({
      stage: 'Service Execution',
      status: 'ASSIGNED',
      action: `Assigned to technician ${techUser.name}`,
      notes: notes || `Work order dispatched to bay.`,
      performedBy: req.user?.name || 'Service Advisor',
      timestamp: new Date(),
    });

    // Notify technician
    store.notifications.unshift({
      _id: 'notif_' + Date.now(),
      recipient: technicianId,
      serviceRequest: reqItem._id,
      caseId: reqItem.caseId,
      title: 'New Service Bay Assignment',
      message: `You have been assigned to Case ${reqItem.caseId} (${reqItem.serviceType}).`,
      type: 'technician_assigned',
      isRead: false,
      createdAt: new Date(),
    });

    store.saveToFile();

    const populated = store.populateRequest(reqItem);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Update Technician execution progress
// @route POST /api/services/:id/technician-progress
exports.updateTechnicianProgress = async (req, res) => {
  try {
    const { status, notes } = req.body; // 'IN_PROGRESS' or 'QUALITY_CHECK'
    const idx = store.serviceRequests.findIndex(
      r => String(r._id) === String(req.params.id) || r.caseId === req.params.id
    );

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const reqItem = store.serviceRequests[idx];
    reqItem.status = status;
    reqItem.updatedAt = new Date();

    let actionText = status === 'IN_PROGRESS' ? 'Service execution started' : 'Service submitted for Quality Check';

    reqItem.timeline.push({
      stage: 'Service Execution',
      status: status,
      action: actionText,
      notes: notes || '',
      performedBy: req.user?.name || 'Technician',
      timestamp: new Date(),
    });

    if (status === 'QUALITY_CHECK') {
      reqItem.currentStage = 'Quality Check & Pickup';
      // Notify Advisor
      store.notifications.unshift({
        _id: 'notif_' + Date.now(),
        recipient: reqItem.assignedAdvisor || 'usr_adv_01',
        serviceRequest: reqItem._id,
        caseId: reqItem.caseId,
        title: 'Ready for Quality Inspection',
        message: `Technician completed physical tasks for ${reqItem.caseId}. Ready for final road test and QA signoff.`,
        type: 'quality_check_passed',
        isRead: false,
        createdAt: new Date(),
      });
    }

    store.saveToFile();

    const populated = store.populateRequest(reqItem);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Complete service & notify customer (Pega completion automation)
// @route POST /api/services/:id/complete
exports.completeService = async (req, res) => {
  try {
    const { notes } = req.body;
    const idx = store.serviceRequests.findIndex(
      r => String(r._id) === String(req.params.id) || r.caseId === req.params.id
    );

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const reqItem = store.serviceRequests[idx];
    reqItem.currentStage = 'Resolved';
    reqItem.status = 'COMPLETED';
    reqItem.updatedAt = new Date();

    reqItem.timeline.push({
      stage: 'Resolved',
      status: 'COMPLETED',
      action: 'Final QA signed off & vehicle service completed',
      notes: notes || 'Vehicle fully detailed, sanitized, and ready for owner pickup.',
      performedBy: req.user?.name || 'Service Advisor',
      timestamp: new Date(),
    });

    // Automatically notify customer upon service completion (Key Project Objective)
    store.notifications.unshift({
      _id: 'notif_' + Date.now(),
      recipient: reqItem.customer,
      serviceRequest: reqItem._id,
      caseId: reqItem.caseId,
      title: 'Vehicle Servicing Completed! 🚗🎉',
      message: `Great news! Your vehicle servicing for Case ${reqItem.caseId} has been successfully completed and passed all quality tests. Your vehicle is ready for pickup!`,
      type: 'service_completed',
      isRead: false,
      createdAt: new Date(),
    });

    store.saveToFile();

    const populated = store.populateRequest(reqItem);
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get Fleet Analytics & Dashboard Stats
// @route GET /api/services/stats/summary
exports.getStats = async (req, res) => {
  try {
    const all = store.serviceRequests;
    const totalRequests = all.length;
    const completed = all.filter(r => r.status === 'COMPLETED').length;
    const inProgress = all.filter(r => ['ASSIGNED', 'IN_PROGRESS', 'QUALITY_CHECK'].includes(r.status)).length;
    const pendingApproval = all.filter(r => r.status === 'AWAITING_APPROVAL').length;
    const newIntake = all.filter(r => ['NEW', 'INSPECTION_PENDING'].includes(r.status)).length;

    // Calculate revenue from approved/completed estimates
    let totalRevenue = 0;
    store.estimates.forEach(e => {
      if (e.customerDecision === 'approved') {
        totalRevenue += e.totalAmount;
      }
    });

    res.json({
      success: true,
      data: {
        totalRequests,
        completed,
        inProgress,
        pendingApproval,
        newIntake,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        slaComplianceRate: 98.4,
        avgTurnaroundHours: 18.2,
        activeServiceCenters: store.serviceCenters.length,
        fleetTechnicians: store.users.filter(u => u.role === 'technician').length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get service centers
// @route GET /api/services/centers
exports.getServiceCenters = async (req, res) => {
  try {
    res.json({ success: true, data: store.serviceCenters });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
