const store = require('../utils/dataStore');

// @desc Submit digital vehicle inspection
// @route POST /api/inspections
exports.createInspection = async (req, res) => {
  try {
    const { serviceRequestId, odometerReading, fuelLevel, checklist, advisorRemarks, recommendImmediateRepair } = req.body;

    if (!serviceRequestId) {
      return res.status(400).json({ success: false, message: 'serviceRequestId is required' });
    }

    const reqItem = store.serviceRequests.find(
      r => String(r._id) === String(serviceRequestId) || r.caseId === serviceRequestId
    );

    if (!reqItem) {
      return res.status(404).json({ success: false, message: 'Case not found' });
    }

    const newInspection = {
      _id: 'insp_' + Date.now(),
      serviceRequest: reqItem._id,
      inspector: req.user._id,
      odometerReading: Number(odometerReading) || reqItem.odometerAtIntake,
      fuelLevel: fuelLevel || '3/4',
      checklist: checklist || [
        { category: 'Braking System', item: 'Brake Pads & Rotors', status: 'pass', notes: 'Checked' },
        { category: 'Tires & Wheels', item: 'Tire Tread Depth & Pressure', status: 'pass', notes: 'Good' },
        { category: 'Engine & Fluids', item: 'Oil & Coolant Levels', status: 'pass', notes: 'Adequate' },
        { category: 'Battery & Electrical', item: '12V Auxiliary / Traction Battery', status: 'pass', notes: 'Healthy' },
      ],
      advisorRemarks: advisorRemarks || 'Inspection completed successfully.',
      recommendImmediateRepair: Boolean(recommendImmediateRepair),
      completedAt: new Date(),
    };

    store.inspections.unshift(newInspection);

    // Link inspection to the case
    reqItem.inspection = newInspection._id;
    reqItem.assignedAdvisor = req.user._id;
    reqItem.currentStage = 'Inspection & Estimate';
    reqItem.status = 'INSPECTION_PENDING';
    reqItem.updatedAt = new Date();

    reqItem.timeline.push({
      stage: 'Inspection & Estimate',
      status: 'INSPECTION_PENDING',
      action: 'Digital vehicle multi-point inspection recorded',
      notes: advisorRemarks || 'Completed comprehensive vehicle safety inspection.',
      performedBy: req.user.name,
      timestamp: new Date(),
    });

    store.saveToFile();

    res.status(201).json({ success: true, data: newInspection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Get inspection by ID or ServiceRequest ID
// @route GET /api/inspections/:id
exports.getInspection = async (req, res) => {
  try {
    const inspection = store.inspections.find(
      i => String(i._id) === String(req.params.id) || String(i.serviceRequest) === String(req.params.id)
    );
    if (!inspection) {
      return res.status(404).json({ success: false, message: 'Inspection not found' });
    }
    res.json({ success: true, data: inspection });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
