import axios from 'axios';
import { storage } from '../utils/storage';

// Production Render backend URL
export const API_BASE_URL = 'https://esport-management-hub.onrender.com/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically append Bearer token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration (401)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      await storage.clearAll();
    }
    return Promise.reject(error);
  }
);

// Helper for formatted API error messages
export const getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message;
  }
  if (error.message === 'Network Error') {
    return 'Unable to reach game server. Please check your internet connection.';
  }
  return error.message || 'An unexpected error occurred. Please try again.';
};
