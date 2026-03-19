import api from './api';

export const cartService = {
  // Add item to cart
  addToCart: async (productId, quantity) => {
    const response = await api.post('/cart', {
      ProductId: productId,
      Quantity: quantity
    });
    return response.data;
  },

  // Get cart items
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  // Clear entire cart (optional - you might need to implement this on backend)
  clearCart: async () => {
    // This would require a new endpoint on your backend
    // For now, we'll remove items one by one on the frontend
    const cartItems = await cartService.getCart();
    const deletePromises = cartItems.map(item => 
      cartService.removeFromCart(item.CartItemId)
    );
    await Promise.all(deletePromises);
  }
};