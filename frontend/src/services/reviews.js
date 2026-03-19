import api from './api';

export const reviewService = {
  // Create review
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  // Get reviews for a product
  getReviews: async (productId) => {
    const response = await api.get(`/reviews/${productId}`);
    return response.data;
  },

  // Get user's reviews
  getUserReviews: async () => {
    // You might need to create this endpoint on backend
    const response = await api.get('/users/reviews');
    return response.data;
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};