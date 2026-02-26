const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validate,
  createComplaintRules,
  updateComplaintRules,
  updateStatusRules,
  assignComplaintRules,
  validateObjectId,
  listComplaintsRules
} = require('../utils/validator');

// GET /api/complaints/stats
router.get('/stats', authenticate, authorize('admin', 'legal_officer'), complaintController.getComplaintStats);

// GET /api/complaints/my
router.get('/my', authenticate, authorize('worker'), listComplaintsRules, validate, complaintController.getMyComplaints);

// POST /api/complaints
router.post('/', authenticate, authorize('worker'), createComplaintRules, validate, complaintController.createComplaint);

// GET /api/complaints
router.get('/', authenticate, authorize('admin'), listComplaintsRules, validate, complaintController.getAllComplaints);

// GET /api/complaints/:id
router.get('/:id', authenticate, validateObjectId, validate, complaintController.getComplaintById);

// PATCH /api/complaints/:id
router.patch('/:id', authenticate, authorize('worker'), validateObjectId, updateComplaintRules, validate, complaintController.updateComplaint);

// PATCH /api/complaints/:id/status
router.patch('/:id/status', authenticate, authorize('admin', 'legal_officer'), validateObjectId, updateStatusRules, validate, complaintController.updateComplaintStatus);

// PATCH /api/complaints/:id/assign
router.patch('/:id/assign', authenticate, authorize('admin'), validateObjectId, assignComplaintRules, validate, complaintController.assignComplaint);

// DELETE /api/complaints/:id
router.delete('/:id', authenticate, validateObjectId, validate, complaintController.deleteComplaint);

// POST /api/complaints/:id/attachments
const { upload } = require('../utils/cloudinary');
router.post('/:id/attachments', authenticate, validateObjectId, upload.single('file'), complaintController.uploadAttachment);

// GET /api/complaints/:id/report
router.get('/:id/report', authenticate, validateObjectId, complaintController.generateReport);

module.exports = router;