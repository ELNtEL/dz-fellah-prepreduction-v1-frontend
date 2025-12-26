// ============================================================
// Cart Service - Updated to match actual API endpoints
// ============================================================

import api from './api';

const cartService = {
  // Get current user's cart
  getMyCart: async () => {
    try {
      const response = await api.get('/cart/my_cart/');
      return response;
    } catch (error) {
      console.error('Get cart error:', error);
      throw error;
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity) => {
    try {
      const response = await api.post('/cart/add_item/', {
        product_id: productId,
        quantity: quantity
      });
      return response;
    } catch (error) {
      console.error('Add to cart error:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateItem: async (itemId, quantity) => {
    try {
      const response = await api.patch(`/cart/update_item/${itemId}/`, {
        quantity: quantity
      });
      return response;
    } catch (error) {
      console.error('Update cart item error:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeItem: async (itemId) => {
    try {
      const response = await api.delete(`/cart/remove_item/${itemId}/`);
      return response;
    } catch (error) {
      console.error('Remove cart item error:', error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart/clear_cart/');
      return response;
    } catch (error) {
      console.error('Clear cart error:', error);
      throw error;
    }
  },

  // Validate cart before checkout
  validateCart: async () => {
    try {
      const response = await api.get('/cart/validate_cart/');
      return response;
    } catch (error) {
      console.error('Validate cart error:', error);
      throw error;
    }
  },
};

export default cartService;