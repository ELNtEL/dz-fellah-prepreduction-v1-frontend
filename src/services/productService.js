// ============================================================
// Product Service
// ============================================================

import api from './api';

const productService = {
  // Get all products with filters
  getAllProducts: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // Product search
      if (filters.search) params.append('search', filters.search);
      
      // Producer search - ✅ ADDED
      if (filters.producer_search) params.append('producer_search', filters.producer_search);
      
      // Product type/category - ✅ ADDED
      if (filters.product_type) params.append('product_type', filters.product_type);
      
      // Anti-gaspi filter - ✅ ADDED
      if (filters.is_anti_gaspi) params.append('is_anti_gaspi', 'true');
      
      // Old filters (keep for backwards compatibility)
      if (filters.category) params.append('category', filters.category);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.in_stock !== undefined) params.append('in_stock', filters.in_stock);
      if (filters.seasonal) params.append('seasonal', filters.seasonal);
      if (filters.anti_waste) params.append('anti_waste', filters.anti_waste);
      if (filters.sort_by) params.append('sort_by', filters.sort_by);
      if (filters.page) params.append('page', filters.page);
      if (filters.page_size) params.append('page_size', filters.page_size);
      
      const queryString = params.toString();
      const response = await api.get(`/products/${queryString ? '?' + queryString : ''}`);
      return response;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },

  // ✅ NEW - Get producer's own products
  getMyProducts: async () => {
    try {
      const response = await api.get('/my-products/');
      return response;
    } catch (error) {
      console.error('Get my products error:', error);
      throw error;
    }
  },

  // Get featured products
  getFeaturedProducts: async (limit = 6) => {
    try {
      const response = await api.get(`/products/featured?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get featured products error:', error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (query) => {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search products error:', error);
      throw error;
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const response = await api.get('/products/categories');
      return response.data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },
};

export default productService;