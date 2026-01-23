import api from './api';

const subscriptionService = {
  // Client - Manage subscriptions
  getMySubscriptions: async (status = null) => {
    const params = status ? `?status=${status}` : '';
    const response = await api.get(`/my-subscriptions/${params}`);
    return response; // 
  },

  subscribe: async (subscriptionData) => {
    const response = await api.post('/my-subscriptions/', subscriptionData);
    return response; //
  },

  pauseSubscription: async (subscriptionId) => {
    const response = await api.post(`/my-subscriptions/${subscriptionId}/pause/`);
    return response; // 
  },

  cancelSubscription: async (subscriptionId) => {
    const response = await api.post(`/my-subscriptions/${subscriptionId}/cancel/`);
    return response; // 
  },

  reactivateSubscription: async (subscriptionId) => {
    const response = await api.post(`/my-subscriptions/${subscriptionId}/reactivate/`);
    return response; // 
  }
};

export default subscriptionService;