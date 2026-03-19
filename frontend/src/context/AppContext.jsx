import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [appLoading, setAppLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load any initial app data here
        // For example: user preferences, categories, etc.
        
        // Simulate loading time
        setTimeout(() => {
          setAppLoading(false);
        }, 1000);
      } catch (error) {
        console.error('App initialization failed:', error);
        setAppLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Notifications
  const addNotification = (notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: notification.type || 'info', // 'success', 'error', 'warning', 'info'
      title: notification.title,
      message: notification.message,
      duration: notification.duration || 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Search and filter functions
  const updateSearchQuery = (query) => {
    setSearchQuery(query);
  };

  const updateSelectedCategory = (category) => {
    setSelectedCategory(category);
  };

  const updateSort = (by, order = 'asc') => {
    setSortBy(by);
    setSortOrder(order);
  };

  // App settings and preferences
  const [preferences, setPreferences] = useState({
    theme: 'light', // 'light' or 'dark'
    language: 'en',
    currency: 'USD',
    notifications: true,
    autoRefresh: true
  });

  const updatePreferences = (newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    
    // Save to localStorage
    localStorage.setItem('appPreferences', JSON.stringify({
      ...preferences,
      ...newPreferences
    }));
  };

  // Load preferences from localStorage on app start
  useEffect(() => {
    const savedPreferences = localStorage.getItem('appPreferences');
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences));
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    }
  }, []);

  // Global error handler
  const [globalError, setGlobalError] = useState(null);

  const setError = (error) => {
    setGlobalError(error);
    addNotification({
      type: 'error',
      title: 'Error',
      message: error.message || 'Something went wrong',
      duration: 8000
    });
  };

  const clearError = () => {
    setGlobalError(null);
  };

  // App statistics (can be used for dashboard, etc.)
  const [appStats, setAppStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });

  const updateAppStats = (newStats) => {
    setAppStats(prev => ({ ...prev, ...newStats }));
  };

  const value = {
    // App state
    appLoading,
    
    // Notifications
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Search and filters
    searchQuery,
    selectedCategory,
    sortBy,
    sortOrder,
    updateSearchQuery,
    updateSelectedCategory,
    updateSort,
    
    // Preferences
    preferences,
    updatePreferences,
    
    // Error handling
    globalError,
    setError,
    clearError,
    
    // App statistics
    appStats,
    updateAppStats
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};