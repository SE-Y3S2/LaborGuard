import axiosInstance from './axiosInstance';

export const authApi = {
  register: (formData) => axiosInstance.post('/auth/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  login: (email, password) => axiosInstance.post('/auth/login', { email, password }),

  verify: (userId, code, type) => axiosInstance.post('/auth/verify', { userId, code, type }),

  forgotPassword: (email) => axiosInstance.post('/auth/forgot-password', { email }),

  resetPassword: (email, code, password) => axiosInstance.post('/auth/reset-password', { email, code, password }),

  logout: () => axiosInstance.post('/auth/logout'),

  changePassword: (currentPassword, newPassword) => axiosInstance.post('/auth/change-password', { currentPassword, newPassword }),

  getProfile: () => axiosInstance.get('/users/me'),

  updateProfile: (data) => axiosInstance.put('/users/me', data),
};
