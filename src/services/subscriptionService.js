import api from './api';

const subscriptionService = {
  // Client - Manage subscriptions
  getMySubscriptions: async (status = null) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/my-subscriptions/${params}`);
    return response.data;
  },

  subscribe: async (subscriptionData) => {
    const response = await api.post('/my-subscriptions/', subscriptionData);
    return response.data;
  },

  pauseSubscription: async (subscriptionId) => {
    const response = await api.post(`/my-subscriptions/${subscriptionId}/pause/`);
    return response.data;
  },

  cancelSubscription: async (subscriptionId) => {
    const response = await api.post(`/my-subscriptions/${subscriptionId}/cancel/`);
    return response.data;
  },

  reactivateSubscription: async (subscriptionId) => {
    const response = await api.post(`/my-subscriptions/${subscriptionId}/reactivate/`);
    return response.data;
  }
};

export default subscriptionService;