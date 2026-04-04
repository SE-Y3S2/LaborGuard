import axiosInstance from './axiosInstance';

export const complaintApi = {
  createComplaint: (data) => axiosInstance.post('/complaints', data),
  getMyComplaints: () => axiosInstance.get('/complaints/my'),
  getComplaintById: (id) => axiosInstance.get(`/complaints/${id}`),
  updateComplaint: (id, data) => axiosInstance.patch(`/complaints/${id}`, data),
  updateStatus: (id, status, reason) => axiosInstance.patch(`/complaints/${id}/status`, { status, reason }),
  assignComplaint: (id, assignedTo) => axiosInstance.patch(`/complaints/${id}/assign`, { assignedTo }),
  deleteComplaint: (id) => axiosInstance.delete(`/complaints/${id}`),
  uploadAttachment: (id, formData) => axiosInstance.post(`/complaints/${id}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => axiosInstance.get('/complaints/stats'),
};
