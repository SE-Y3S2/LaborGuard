const express = require('express');
const router = express.Router();

const appointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validate,
  validateObjectId,
  confirmAppointmentRules,
  rescheduleAppointmentRules,
  cancelAppointmentRules,
  listAppointmentRules
} = require('../utils/validator');

// GET /api/appointments/my
router.get('/my', authenticate, authorize('worker'), listAppointmentRules, validate, appointmentController.getMyAppointments);

// GET /api/appointments/assigned
router.get('/assigned', authenticate, authorize('legal_officer'), listAppointmentRules, validate, appointmentController.getAssignedAppointments);

// GET /api/appointments
router.get('/', authenticate, authorize('admin'), listAppointmentRules, validate, appointmentController.getAllAppointments);

// GET /api/appointments/:id
router.get('/:id', authenticate, validateObjectId, validate, appointmentController.getAppointmentById);

// PATCH /api/appointments/:id/confirm
router.patch('/:id/confirm', authenticate, authorize('admin'), validateObjectId, confirmAppointmentRules, validate, appointmentController.confirmAppointment);

// PATCH /api/appointments/:id/reschedule
router.patch('/:id/reschedule', authenticate, authorize('admin', 'legal_officer'), validateObjectId, rescheduleAppointmentRules, validate, appointmentController.rescheduleAppointment);

// PATCH /api/appointments/:id/cancel
router.patch('/:id/cancel', authenticate, authorize('admin'), validateObjectId, cancelAppointmentRules, validate, appointmentController.cancelAppointment);

module.exports = router;