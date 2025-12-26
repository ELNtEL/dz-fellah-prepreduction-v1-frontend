// ============================================================
// Order Service - Updated to match actual API endpoints
// ============================================================

import api from './api';

const orderService = {
  // Get current user's orders
  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/my_orders/');
      return response;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  },

  // Get single order details
  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/`);
      return response;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  },

  // Create order from cart
  createOrderFromCart: async (orderData) => {
    try {
      const response = await api.post('/orders/create_from_cart/', {
        delivery_method: orderData.delivery_method || 'pickup_producer',
        delivery_address: orderData.delivery_address,
        notes: orderData.notes
      });
      return response;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel/`);
      return response;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  },
};

export default orderService;