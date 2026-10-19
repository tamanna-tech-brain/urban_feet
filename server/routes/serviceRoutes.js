const express = require('express');
const router = express.Router();
const {
  getServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  updateStageStatus,
  assignTechnician,
  updateTechnicianProgress,
  completeService,
  getStats,
  getServiceCenters,
  createOrStartVideoConsultation,
  endVideoConsultation,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/stats/summary', protect, getStats);
router.get('/centers', getServiceCenters);

router.route('/')
  .get(protect, getServiceRequests)
  .post(protect, createServiceRequest);

router.route('/:id')
  .get(protect, getServiceRequestById);

router.patch('/:id/stage', protect, updateStageStatus);
router.post('/:id/assign-technician', protect, assignTechnician);
router.post('/:id/technician-progress', protect, updateTechnicianProgress);
router.post('/:id/complete', protect, completeService);
router.post('/:id/video-consultation', protect, createOrStartVideoConsultation);
router.post('/:id/video-consultation/end', protect, endVideoConsultation);

module.exports = router;
