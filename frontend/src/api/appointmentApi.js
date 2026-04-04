// NEW FILE — appointmentApi.js
// FIX: This file was missing entirely. The backend has full appointment routes
// in complaint-service at /api/appointments but no frontend API layer existed.
// Backend routes reference: backend/services/complaint-service/src/routes/appointmentRoutes.js

import { complaintClient } from './apiClient';

export const appointmentApi = {
  /**
   * GET /api/appointments/my
   * Worker: fetch own appointments
   */
  getMyAppointments: (params) =>
    complaintClient.get('/appointments/my', { params }),

  /**
   * GET /api/appointments/assigned
   * Lawyer (legal_officer): fetch appointments assigned to them
   */
  getAssignedAppointments: (params) =>
    complaintClient.get('/appointments/assigned', { params }),

  /**
   * GET /api/appointments
   * Admin: fetch all appointments
   */
  getAllAppointments: (params) =>
    complaintClient.get('/appointments', { params }),

  /**
   * GET /api/appointments/:id
   * Any authenticated user
   */
  getAppointmentById: (id) => complaintClient.get(`/appointments/${id}`),

  /**
   * PATCH /api/appointments/:id/confirm
   * Admin: confirm an appointment
   * Body: { scheduledDate, notes }
   */
  confirmAppointment: (id, data) =>
    complaintClient.patch(`/appointments/${id}/confirm`, data),

  /**
   * PATCH /api/appointments/:id/reschedule
   * Admin or Lawyer: reschedule an appointment
   * Body: { scheduledDate, reason }
   */
  rescheduleAppointment: (id, data) =>
    complaintClient.patch(`/appointments/${id}/reschedule`, data),

  /**
   * PATCH /api/appointments/:id/cancel
   * Admin: cancel an appointment
   * Body: { reason }
   */
  cancelAppointment: (id, data) =>
    complaintClient.patch(`/appointments/${id}/cancel`, data),
};
