import axios from 'axios';

const AUTH_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5001/api';
const COMPLAINT_BASE_URL = import.meta.env.VITE_COMPLAINT_API_URL || 'http://localhost:3003/api';

const authApi = axios.create({
  baseURL: AUTH_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const complaintApi = axios.create({
  baseURL: COMPLAINT_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const attachToken = (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

authApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));
complaintApi.interceptors.request.use(attachToken, (error) => Promise.reject(error));

export { authApi, complaintApi };
