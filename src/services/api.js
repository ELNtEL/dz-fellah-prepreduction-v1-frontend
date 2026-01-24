// ============================================================
// Base API Configuration with JWT Authentication
// ============================================================

import axios from 'axios';

// Base URL for backend API - uses environment variable in production
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds - increased for slower Railway backend
});

// Request interceptor - Add JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access');
    console.log('🔑 Token being sent:', token ? 'EXISTS' : 'NULL');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📦 API Response:', response.data);
    return response.data; // Return only data, not full response
  },
  async (error) => {
    // Just log 401 errors, don't auto-logout
    if (error.response?.status === 401) {
      console.error('❌ Unauthorized request:', error.config.url);
      console.error('❌ Token in storage:', localStorage.getItem('access'));
    }
    
    return Promise.reject(error);
  }
);

export default api;