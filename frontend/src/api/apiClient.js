import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Common Interceptor for Authorization
const attachAuthToken = (config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
};

// Common Interceptor for Token Refresh
const handleTokenRefresh = async (error) => {
  const originalRequest = error.config;
  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    try {
      const { refreshToken, setTokens, logout } = useAuthStore.getState();
      if (!refreshToken) throw new Error('No refresh token');

      // Always use Auth Service URL for refresh
      const response = await axios.post(`${import.meta.env.VITE_AUTH_SERVICE_URL}/api/auth/refresh`, {
        token: refreshToken,
      });

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
      setTokens(newAccessToken, newRefreshToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return axios(originalRequest);
    } catch (err) {
      useAuthStore.getState().logout();
      return Promise.reject(err);
    }
  }
  return Promise.reject(error);
};

// Create Service-Specific Clients
export const authClient = axios.create({
  baseURL: `${import.meta.env.VITE_AUTH_SERVICE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

export const communityClient = axios.create({
  baseURL: `${import.meta.env.VITE_COMMUNITY_SERVICE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

export const complaintClient = axios.create({
  baseURL: `${import.meta.env.VITE_COMPLAINT_SERVICE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

export const jobClient = axios.create({
  baseURL: `${import.meta.env.VITE_JOB_SERVICE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

export const messageClient = axios.create({
  baseURL: `${import.meta.env.VITE_MESSAGING_SERVICE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

export const notificationClient = axios.create({
  baseURL: `${import.meta.env.VITE_NOTIFICATION_SERVICE_URL}/api`,
  headers: { 'Content-Type': 'application/json' }
});

// Attach Interceptors to ALL Clients
const clients = [authClient, communityClient, complaintClient, jobClient, messageClient, notificationClient];
clients.forEach(client => {
  client.interceptors.request.use(attachAuthToken, (error) => Promise.reject(error));
  client.interceptors.response.use((response) => response, handleTokenRefresh);
});
