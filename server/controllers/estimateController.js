const store = require('../utils/dataStore');

// @desc Create Estimate (Service Advisor)
// @route POST /api/estimates
exports.createEstimate = async (req, res) => {
  try {
    const { serviceRequestId, items, discount, estimatedHours, advisorNotes } = req.body;

    if (!serviceRequestId || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Please provide serviceRequestId and estimate items' });
    }

    const reqItem = store.serviceRequests.find(
      r => String(r._id) === String(serviceRequestId) || r.caseId === serviceRequestId
    );

    if (!reqItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    // Calculate subtotal, tax, and total
    let subtotal = 0;
    const computedItems = items.map(item => {
      const q = Number(item.quantity) || 1;
      const p = Number(item.unitPrice) || 0;
      const tot = Math.round(q * p * 100) / 100;
      subtotal += tot;
      return {
        type: item.type || 'part',
        description: item.description,
        quantity: q,
        unitPrice: p,
        total: tot,
      };
    });

    const taxRate = 8.5;
    const disc = Number(discount) || 0;
    const taxableAmount = Math.max(0, subtotal - disc);
    const taxAmount = Math.round(taxableAmount * (taxRate / 100) * 100) / 100;
    const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

    const newEstimate = {
      _id: 'est_' + Date.now(),
      serviceRequest: reqItem._id,
      preparedBy: req.user._id,
      items: computedItems,
      subtotal,
      taxRate,
      taxAmount,
      discount: disc,
      totalAmount,
      estimatedHours: Number(estimatedHours) || 2.5,
      advisorNotes: advisorNotes || '',
      customerDecision: 'pending',
      customerNotes: '',
      customerSignature: '',
      decisionTimestamp: null,
      createdAt: new Date(),
    };

    store.estimates.unshift(newEstimate);

    // Update Case status to AWAITING_APPROVAL
    reqItem.estimate = newEstimate._id;
    reqItem.currentStage = 'Customer Approval';
    reqItem.status = 'AWAITING_APPROVAL';
    reqItem.updatedAt = new Date();

    reqItem.timeline.push({
      stage: 'Customer Approval',
      status: 'AWAITING_APPROVAL',
      action: `Estimate of $${totalAmount.toFixed(2)} generated and submitted to customer`,
      notes: advisorNotes || 'Itemized quote ready for digital approval.',
      performedBy: req.user.name,
      timestamp: new Date(),
    });

    // Notify customer
    store.notifications.unshift({
      _id: 'notif_' + Date.now(),
      recipient: reqItem.customer,
      serviceRequest: reqItem._id,
      caseId: reqItem.caseId,
      title: 'Action Required: Service Estimate Ready',
      message: `${req.user.name} has submitted an estimate ($${totalAmount.toFixed(2)}) for your approval on case ${reqItem.caseId}.`,
      type: 'estimate_ready',
      isRead: false,
      createdAt: new Date(),
    });

    store.saveToFile();

    res.status(201).json({ success: true, data: newEstimate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Customer Approval / Rejection Decision
// @route POST /api/estimates/:id/decision
exports.customerDecision = async (req, res) => {
  try {
    const { decision, customerSignature, customerNotes } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be approved or rejected' });
    }

    const estimate = store.estimates.find(
      e => String(e._id) === String(req.params.id) || String(e.serviceRequest) === String(req.params.id)
    );

    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Estimate not found' });
    }

    const reqItem = store.serviceRequests.find(r => String(r._id) === String(estimate.serviceRequest));
    if (!reqItem) {
      return res.status(404).json({ success: false, message: 'Associated case not found' });
    }

    estimate.customerDecision = decision;
    estimate.customerSignature = customerSignature || (decision === 'approved' ? 'Digital Consent Verified' : '');
    estimate.customerNotes = customerNotes || '';
    estimate.decisionTimestamp = new Date();

    if (decision === 'approved') {
      reqItem.currentStage = 'Service Execution';
      reqItem.status = 'APPROVED';
      reqItem.updatedAt = new Date();

      reqItem.timeline.push({
        stage: 'Customer Approval',
        status: 'APPROVED',
        action: `Customer approved service estimate of $${estimate.totalAmount.toFixed(2)}`,
        notes: customerNotes || `Digitally signed by ${req.user.name} (${estimate.customerSignature})`,
        performedBy: req.user.name,
        timestamp: new Date(),
      });

      // Automated notification to advisor to assign technician
      store.notifications.unshift({
        _id: 'notif_' + Date.now(),
        recipient: reqItem.assignedAdvisor || 'usr_adv_01',
        serviceRequest: reqItem._id,
        caseId: reqItem.caseId,
        title: 'Customer Approved Estimate! 🚀',
        message: `Customer approved quote ($${estimate.totalAmount.toFixed(2)}) for ${reqItem.caseId}. Work order ready for technician assignment.`,
        type: 'approval_received',
        isRead: false,
        createdAt: new Date(),
      });
    } else {
      reqItem.status = 'REJECTED';
      reqItem.updatedAt = new Date();

      reqItem.timeline.push({
        stage: 'Customer Approval',
        status: 'REJECTED',
        action: 'Customer declined service estimate',
        notes: customerNotes || 'Customer opted out or requested estimate revision.',
        performedBy: req.user.name,
        timestamp: new Date(),
      });

      store.notifications.unshift({
        _id: 'notif_' + Date.now(),
        recipient: reqItem.assignedAdvisor || 'usr_adv_01',
        serviceRequest: reqItem._id,
        caseId: reqItem.caseId,
        title: 'Estimate Declined by Customer',
        message: `Customer declined estimate for ${reqItem.caseId}. Reason: ${customerNotes || 'No notes provided'}.`,
        type: 'rejection_received',
        isRead: false,
        createdAt: new Date(),
      });
    }

    store.saveToFile();

    res.json({ success: true, data: estimate, case: store.populateRequest(reqItem) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get estimate by ID or ServiceRequest ID
// @route GET /api/estimates/:id
exports.getEstimate = async (req, res) => {
  try {
    const estimate = store.estimates.find(
      e => String(e._id) === String(req.params.id) || String(e.serviceRequest) === String(req.params.id)
    );
    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Estimate not found' });
    }
    res.json({ success: true, data: estimate });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
