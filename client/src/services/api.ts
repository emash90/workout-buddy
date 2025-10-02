import axios from 'axios';
import Cookies from 'js-cookie';

// Get API URL from environment variable or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const TOKEN_NAME = 'access_token';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_NAME);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const isLoginOrSignup = error.config?.url?.includes('/auth/login') ||
                           error.config?.url?.includes('/auth/signup');

    // If 401 and NOT from login/signup endpoints, redirect to login
    if (error.response?.status === 401 && !isLoginOrSignup) {
      Cookies.remove(TOKEN_NAME);
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
