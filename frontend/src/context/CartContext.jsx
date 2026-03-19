import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/cart';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const loadCart = async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = await cartService.getCart();
      setCartItems(items || []);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity) => {
    if (!isAuthenticated) {
      setError('Please login to add items to cart');
      return { success: false, error: 'Please login to add items to cart' };
    }

    setError(null);
    try {
      await cartService.addToCart(productId, quantity);
      await loadCart(); // Reload cart to get updated data
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const removeFromCart = async (cartItemId) => {
    setError(null);
    try {
      await cartService.removeFromCart(cartItemId);
      setCartItems(prev => prev.filter(item => item.CartItemId !== cartItemId));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to remove item from cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateCartItemQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) {
      return await removeFromCart(cartItemId);
    }

    setError(null);
    try {
      // Find the item to get productId
      const item = cartItems.find(item => item.CartItemId === cartItemId);
      if (!item) {
        throw new Error('Item not found in cart');
      }

      // Calculate the difference to add/remove
      const difference = newQuantity - item.Quantity;
      await cartService.addToCart(item.ProductId, difference);
      await loadCart(); // Reload cart to get updated data
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update item quantity';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearCart = async () => {
    setError(null);
    try {
      // Remove all items one by one
      const deletePromises = cartItems.map(item => 
        cartService.removeFromCart(item.CartItemId)
      );
      await Promise.all(deletePromises);
      setCartItems([]);
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Helper functions
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.Price * item.Quantity), 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.Quantity, 0);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.ProductId === productId);
  };

  // Load cart when authentication changes
  useEffect(() => {
    loadCart();
  }, [isAuthenticated]);

  const value = {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    loadCart,
    clearError,
    getCartTotal,
    getCartItemsCount,
    getCartItem
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};