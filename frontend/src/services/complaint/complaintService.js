import { complaintApi } from './apiClient';

export const getComplaintStats = () => complaintApi.get('/complaints/stats');
export const getMyComplaints = (params) => complaintApi.get('/complaints/my', { params });
export const getAllComplaints = (params) => complaintApi.get('/complaints', { params });
export const getAssignedComplaints = (params) => complaintApi.get('/complaints', { params });
export const getComplaintById = (complaintId) => complaintApi.get(`/complaints/${complaintId}`);
export const createComplaint = (payload) => complaintApi.post('/complaints', payload);
export const updateComplaint = (complaintId, payload) => complaintApi.patch(`/complaints/${complaintId}`, payload);
export const updateComplaintStatus = (complaintId, payload) => complaintApi.patch(`/complaints/${complaintId}/status`, payload);
export const assignComplaint = (complaintId, payload) => complaintApi.patch(`/complaints/${complaintId}/assign`, payload);
