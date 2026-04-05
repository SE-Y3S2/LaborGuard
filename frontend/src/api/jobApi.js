import { jobClient } from './apiClient';

export const jobApi = {
  // Public
  getJobs:       (params) => jobClient.get('/jobs', { params }),
  getJobById:    (id)     => jobClient.get(`/jobs/${id}`),

  // Employer: CRUD
  createJob:     (data)       => jobClient.post('/jobs', data),
  // FIX: was PATCH — backend route is PUT /:id
  updateJob:     (id, data)   => jobClient.put(`/jobs/${id}`, data),
  deleteJob:     (id)         => jobClient.delete(`/jobs/${id}`),
  getEmployerJobs: ()         => jobClient.get('/jobs/my-listings'),

  // Worker
  // FIX: renamed from applyToJob → applyForJob to match useJobs hook call
  applyForJob:   (jobId, data) => jobClient.post(`/jobs/${jobId}/apply`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // FIX: added — useJobs hook calls jobApi.getMyApplications() but old file had no such method
  getMyApplications: () => jobClient.get('/jobs/my-applications'),

  // Employer: applications
  // FIX: renamed from getApplications → getJobApplications to match useJobs hook call
  getJobApplications: (jobId) => jobClient.get(`/jobs/${jobId}/applications`),

  // FIX: was PATCH /applications/:appId/status (wrong method + wrong path prefix)
  // Backend: PUT /api/jobs/applications/:appId/status
  updateApplicationStatus: (appId, status) =>
    jobClient.put(`/jobs/applications/${appId}/status`, { status }),
};