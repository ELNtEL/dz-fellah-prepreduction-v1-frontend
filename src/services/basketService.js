import api from './api';

const basketService = {
  // Public - Browse baskets
  getAllBaskets: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.producer_id) params.append('producer_id', filters.producer_id);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/seasonal-baskets/?${params}`);
    return response; // 
  },

  getBasketDetail: async (basketId) => {
    const response = await api.get(`/seasonal-baskets/${basketId}/`);
    return response; // 
  },

  // Producer - Manage baskets
  getMyBaskets: async () => {
    const response = await api.get('/my-seasonal-baskets/');
    return response; // 
  },

  createBasket: async (basketData) => {
    const response = await api.post('/my-seasonal-baskets/', basketData);
    return response; // 
  },

  updateBasket: async (basketId, basketData) => {
    const response = await api.patch(`/my-seasonal-baskets/${basketId}/`, basketData);
    return response; // 
  },

  deleteBasket: async (basketId) => {
    const response = await api.delete(`/my-seasonal-baskets/${basketId}/`);
    return response; // 
  },

  addProductToBasket: async (basketId, productId, quantity) => {
    const response = await api.post(`/my-seasonal-baskets/${basketId}/add-product/`, {
      product_id: productId,
      quantity: quantity
    });
    return response; // 
  },

  removeProductFromBasket: async (basketId, productId) => {
    const response = await api.delete(`/my-seasonal-baskets/${basketId}/remove-product/${productId}/`);
    return response; // 
  },

  getBasketSubscribers: async (basketId) => {
    const response = await api.get(`/my-seasonal-baskets/${basketId}/subscribers/`);
    return response; // 
  }
};

export default basketService;