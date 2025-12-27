import api from './api';

const subscriptionService = {
  // Client - Manage subscriptions
  getMySubscriptions: async (status = null) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/my-subscriptions/${params}`);
    return response; // ✅ REMOVE .data (api.js already returns response.data)
  },

  subscribe: async (subscriptionData) => {
    const response = await api.post('/my-subscriptions/', subscriptionData);
    return response; // ✅ REMOVE .data
  },

  pauseSubscription: async (subscriptionId) => {
    const response = await api.post(`/my-subscriptions/${subscriptionId}/pause/`);
    return response; // ✅ REMOVE .data
  },

  cancelSubscription: async (subscriptionId) => {
    const response = await api.post(`/my-subscriptions/${subscriptionId}/cancel/`);
    return response; // ✅ REMOVE .data
  },

  reactivateSubscription: async (subscriptionId) => {
    const response = await api.post(`/my-subscriptions/${subscriptionId}/reactivate/`);
    return response; // ✅ REMOVE .data
  }
};

export default subscriptionService;