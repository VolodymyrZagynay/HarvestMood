import { STORAGE_KEYS } from './constants';

/**
 * Generic localStorage helper
 */
export const storage = {
  // Get item from localStorage
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error);
      return null;
    }
  },

  // Set item in localStorage
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error);
      return false;
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error);
      return false;
    }
  },

  // Clear all app data from localStorage
  clear: () => {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
};

/**
 * Theme management
 */
export const theme = {
  // Get current theme
  get: () => {
    return storage.get(STORAGE_KEYS.THEME) || 'light';
  },

  // Set theme
  set: (theme) => {
    const success = storage.set(STORAGE_KEYS.THEME, theme);
    if (success) {
      document.documentElement.setAttribute('data-theme', theme);
    }
    return success;
  },

  // Toggle between light and dark theme
  toggle: () => {
    const currentTheme = theme.get();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    return theme.set(newTheme);
  },

  // Initialize theme
  init: () => {
    const savedTheme = theme.get();
    theme.set(savedTheme);
    return savedTheme;
  }
};

/**
 * User preferences management
 */
export const preferences = {
  // Get all preferences
  get: () => {
    return storage.get(STORAGE_KEYS.PREFERENCES) || {
      theme: 'light',
      language: 'en',
      currency: 'USD',
      notifications: true,
      autoRefresh: true
    };
  },

  // Set preferences
  set: (newPreferences) => {
    const current = preferences.get();
    const updated = { ...current, ...newPreferences };
    return storage.set(STORAGE_KEYS.PREFERENCES, updated);
  },

  // Get specific preference
  getPreference: (key) => {
    const prefs = preferences.get();
    return prefs[key];
  },

  // Set specific preference
  setPreference: (key, value) => {
    return preferences.set({ [key]: value });
  }
};

/**
 * Cart persistence (for guest users)
 */
export const cartStorage = {
  // Get cart from storage
  get: () => {
    return storage.get(STORAGE_KEYS.CART) || [];
  },

  // Save cart to storage
  set: (cartItems) => {
    return storage.set(STORAGE_KEYS.CART, cartItems);
  },

  // Clear cart from storage
  clear: () => {
    return storage.remove(STORAGE_KEYS.CART);
  },

  // Add item to cart in storage
  addItem: (product, quantity = 1) => {
    const cart = cartStorage.get();
    const existingItem = cart.find(item => item.ProductId === product.ProductId);
    
    if (existingItem) {
      existingItem.Quantity += quantity;
    } else {
      cart.push({
        ...product,
        Quantity: quantity,
        CartItemId: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }
    
    return cartStorage.set(cart);
  },

  // Remove item from cart in storage
  removeItem: (cartItemId) => {
    const cart = cartStorage.get();
    const updatedCart = cart.filter(item => item.CartItemId !== cartItemId);
    return cartStorage.set(updatedCart);
  },

  // Update item quantity in storage
  updateQuantity: (cartItemId, quantity) => {
    const cart = cartStorage.get();
    const item = cart.find(item => item.CartItemId === cartItemId);
    
    if (item) {
      if (quantity <= 0) {
        return cartStorage.removeItem(cartItemId);
      }
      item.Quantity = quantity;
      return cartStorage.set(cart);
    }
    
    return false;
  }
};

/**
 * Recent searches management
 */
export const recentSearches = {
  // Get recent searches
  get: () => {
    return storage.get('recent_searches') || [];
  },

  // Add search term
  add: (searchTerm) => {
    if (!searchTerm.trim()) return;
    
    const searches = recentSearches.get();
    const filtered = searches.filter(term => term !== searchTerm);
    const updated = [searchTerm, ...filtered].slice(0, 10); // Keep last 10
    
    storage.set('recent_searches', updated);
  },

  // Clear recent searches
  clear: () => {
    storage.remove('recent_searches');
  }
};