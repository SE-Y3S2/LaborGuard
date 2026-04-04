import { complaintClient } from './apiClient';

export const complaintApi = {
  createComplaint: (data) => complaintClient.post('/complaints', data),
  getMyComplaints: () => complaintClient.get('/complaints/my'),
  getComplaintById: (id) => complaintClient.get(`/complaints/${id}`),
  updateComplaint: (id, data) => complaintClient.patch(`/complaints/${id}`, data),
  updateStatus: (id, status, reason) => complaintClient.patch(`/complaints/${id}/status`, { status, reason }),
  assignComplaint: (id, assignedTo) => complaintClient.patch(`/complaints/${id}/assign`, { assignedTo }),
  deleteComplaint: (id) => complaintClient.delete(`/complaints/${id}`),
  uploadAttachment: (id, formData) => complaintClient.post(`/complaints/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => complaintClient.get('/complaints/stats'),
};
