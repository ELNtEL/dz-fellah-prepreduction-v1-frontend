// ============================================================
// Producer Service
// ============================================================

import api from './api';

const producerService = {
  // Get all producers/stores
   getAllProducers: async (filters = {}) => {
   try {
    const params = new URLSearchParams();
    
    // ✅ ADD THESE
    if (filters.search) params.append('search', filters.search);
    if (filters.wilaya) params.append('wilaya', filters.wilaya);
    if (filters.city) params.append('city', filters.city);
    if (filters.is_bio_certified) params.append('is_bio_certified', 'true');
    
    // Existing filters
    if (filters.page) params.append('page', filters.page);
    if (filters.page_size) params.append('page_size', filters.page_size);
    
    const queryString = params.toString();
    const response = await api.get(`/producers/${queryString ? '?' + queryString : ''}`);
    return response;
  } catch (error) {
    console.error('Get producers error:', error);
    throw error;
    } 
  },

  // Get single producer details
  getProducerById: async (producerId) => {
    try {
      const response = await api.get(`/producers/${producerId}`);
      return response.data;
    } catch (error) {
      console.error('Get producer error:', error);
      throw error;
    }
  },

  // Get products by producer - FIXED ENDPOINT
  getProducerProducts: async (producerId) => {
    try {
      const response = await api.get(`/products/producer/${producerId}/`);
      return response;
    } catch (error) {
      console.error('Get producer products error:', error);
      throw error;
    }
  },
};

export default producerService;