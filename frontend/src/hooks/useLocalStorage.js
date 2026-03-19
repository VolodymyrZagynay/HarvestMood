import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Get stored value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Specialized hooks for common use cases
export const useAuthToken = () => {
  return useLocalStorage('token', null);
};

export const useUserPreferences = () => {
  return useLocalStorage('userPreferences', {
    theme: 'light',
    language: 'en',
    currency: 'USD',
    notifications: true
  });
};

export const useRecentSearches = () => {
  const [recentSearches, setRecentSearches] = useLocalStorage('recentSearches', []);
  
  const addSearch = (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    setRecentSearches(prev => {
      const filtered = prev.filter(term => term !== searchTerm);
      return [searchTerm, ...filtered].slice(0, 10); // Keep only last 10 searches
    });
  };
  
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };
  
  return {
    recentSearches,
    addSearch,
    clearRecentSearches
  };
};

export const useCartPersistance = () => {
  const [cartData, setCartData] = useLocalStorage('cartData', {
    items: [],
    lastUpdated: null
  });
  
  const saveCart = (items) => {
    setCartData({
      items,
      lastUpdated: new Date().toISOString()
    });
  };
  
  const getCart = () => {
    return cartData.items;
  };
  
  const clearCart = () => {
    setCartData({
      items: [],
      lastUpdated: null
    });
  };
  
  return {
    saveCart,
    getCart,
    clearCart,
    lastUpdated: cartData.lastUpdated
  };
};