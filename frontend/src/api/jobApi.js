import axiosInstance from './axiosInstance';

export const jobApi = {
  createJob: (data) => axiosInstance.post('/jobs', data),
  getJobs: (params) => axiosInstance.get('/jobs', { params }),
  getJobById: (id) => axiosInstance.get(`/jobs/${id}`),
  updateJob: (id, data) => axiosInstance.put(`/jobs/${id}`, data),
  deleteJob: (id) => axiosInstance.delete(`/jobs/${id}`),
  applyForJob: (id, data) => axiosInstance.post(`/jobs/${id}/apply`, data),
  getMyApplications: () => axiosInstance.get('/jobs/my-applications'),
  updateApplicationStatus: (appId, status) => axiosInstance.put(`/jobs/applications/${appId}/status`, { status }),
  getJobApplications: (id) => axiosInstance.get(`/jobs/${id}/applications`),
};
