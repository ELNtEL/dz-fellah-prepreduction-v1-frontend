// ============================================================
// Rating Service
// ============================================================

import api from './api';

const ratingService = {
  // Create or update a product rating
  rateProduct: async (productId, rating) => {
    try {
      const response = await api.post('/products/rate/', {
        product_id: productId,
        rating: rating
      });
      return response; // Interceptor already returns response.data
    } catch (error) {
      console.error('Rate product error:', error);
      throw error;
    }
  },

  // Get rating summary for a product
  getProductRatings: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/ratings/`);
      return response; // Interceptor already returns response.data
    } catch (error) {
      console.error('Get product ratings error:', error);
      throw error;
    }
  },

  // Get current user's rating for a product
  getMyRating: async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/my-rating/`);
      return response; // Interceptor already returns response.data
    } catch (error) {
      console.error('Get my rating error:', error);
      throw error;
    }
  },

  // Delete user's rating for a product
  deleteRating: async (productId) => {
    try {
      const response = await api.delete(`/products/${productId}/rating/`);
      return response; // Interceptor already returns response.data
    } catch (error) {
      console.error('Delete rating error:', error);
      throw error;
    }
  },

  // Get producer's overall rating
  getProducerRating: async (producerId) => {
    try {
      const response = await api.get(`/products/producer/${producerId}/rating/`);
      return response; // Interceptor already returns response.data
    } catch (error) {
      console.error('Get producer rating error:', error);
      throw error;
    }
  },
};

export default ratingService;
