import { jobClient } from './apiClient';

export const jobApi = {
  getJobs: (params) => jobClient.get('/jobs', { params }),
  getJobById: (id) => jobClient.get(`/jobs/${id}`),
  createJob: (data) => jobClient.post('/jobs', data),
  updateJob: (id, data) => jobClient.patch(`/jobs/${id}`, data),
  deleteJob: (id) => jobClient.delete(`/jobs/${id}`),
  getEmployerJobs: () => jobClient.get('/jobs/my-listings'),
  applyToJob: (jobId, data) => jobClient.post(`/jobs/${jobId}/apply`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getApplications: (jobId) => jobClient.get(`/jobs/${jobId}/applications`),
  updateApplicationStatus: (appId, status) => jobClient.patch(`/applications/${appId}/status`, { status }),
};
