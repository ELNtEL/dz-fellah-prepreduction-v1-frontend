import api from './api';

const userService = {
  // Update current user profile
  updateProfile: async (updates) => {
    try {
      const response = await api.patch('/users/update_me/', updates);
      
      // Update localStorage with new user data
      if (response.user) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Get current user data
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me/');
      return response;
    } catch (error) {
      console.error('Get user error:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default userService;