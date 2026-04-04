import { authClient } from './apiClient';

export const authApi = {
  login: (data) => authClient.post('/auth/login', data),
  register: (data) => authClient.post('/auth/register', data),
  verifyEmail: (code) => authClient.post('/auth/verify-email', { code }),
  resendVerification: (email) => authClient.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => authClient.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => authClient.post(`/auth/reset-password/${token}`, { password }),
  getProfile: () => authClient.get('/auth/me'),
  updateProfile: (data) => authClient.patch('/auth/me', data),
};
