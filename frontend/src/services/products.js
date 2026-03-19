import api from './api';

export const productService = {
  // Get all products with optional search and category filters
  getProducts: async (search = '', category = '') => {
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    
    const response = await api.get('/products', { params });
    return response.data;
  },

  // services/products.js - додайте цей метод
  getMyProducts: async () => {
    const response = await api.get('/my-products'); // Використовує ваш endpoint
    return response.data;
  },

  // Get product by ID
  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product (Farmer only)
  createProduct: async (formData) => {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update product (Farmer only)
  updateProduct: async (id, formData) => {
    const response = await api.put(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete product (Farmer only)
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (query) => {
    const response = await api.get('/products/search', { params: { q: query } });
    return response.data;
  }
};