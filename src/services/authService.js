// ============================================================
// Authentication Service
// ============================================================

import api from './api';

const authService = {
  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login/', credentials);
      
      // Store tokens and user info
      // FIXED: Use 'access' and 'refresh' to match api.js
      if (response.tokens?.access) {
        localStorage.setItem('access', response.tokens.access);  // ✅ FIXED!
        localStorage.setItem('refresh', response.tokens.refresh);  // ✅ FIXED!
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Register
  register: async (userData, userType = 'client') => {
    try {
      const endpoint = userType === 'producer' 
        ? '/auth/register/producer/' 
        : '/auth/register/client/';
      
      const response = await api.post(endpoint, userData);
      
      // Store tokens and user info
      // FIXED: Use 'access' and 'refresh' to match api.js
      if (response.tokens?.access) {
        localStorage.setItem('access', response.tokens.access);  //
        localStorage.setItem('refresh', response.tokens.refresh);  //
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless
      // FIXED: Use 'access' and 'refresh' to match api.js
      localStorage.removeItem('access');  // 
      localStorage.removeItem('refresh');  //
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get current user ID
  getCurrentUserId: () => {
    const user = authService.getCurrentUser();
    return user?.id || null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('access');  //
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.patch('/users/update_me/', profileData);

      // Update user in local storage
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default authService;