// App constants
export const APP_CONFIG = {
  NAME: 'Harvest Mood',
  VERSION: '1.0.0',
  DESCRIPTION: 'Fresh farm products marketplace',
  SUPPORT_EMAIL: 'support@harvestmood.com',
  SUPPORT_PHONE: '1-800-FARM-FRESH',
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:4000'
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/login',
    REGISTER: '/api/register',
    USERS: '/api/users',
    USER_BY_ID: '/api/users/:id'
  },
  PRODUCTS: {
    BASE: '/api/products',
    BY_ID: '/api/products/:id',
    SEARCH: '/api/products/search'
  },
  CART: {
    BASE: '/api/cart',
    BY_ID: '/api/cart/:id'
  },
  ORDERS: {
    BASE: '/api/orders',
    BY_ID: '/api/orders/:id'
  },
  REVIEWS: {
    BASE: '/api/reviews',
    BY_PRODUCT_ID: '/api/reviews/:productId'
  },
  CATEGORIES: {
    BASE: '/api/categories'
  }
};

// User roles
export const USER_ROLES = {
  FARMER: 'Farmer',
  CUSTOMER: 'Customer'
};

// Product categories
export const PRODUCT_CATEGORIES = [
  'Vegetables',
  'Fruits',
  'Dairy',
  'Grains',
  'Herbs',
  'Meat',
  'Organic',
  'Other'
];

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'Pending',
  PAID: 'Paid',
  SHIPPED: 'Shipped',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  PAYPAL: 'PayPal'
};

// Shipping options
export const SHIPPING_OPTIONS = {
  STANDARD: {
    name: 'Standard Shipping',
    price: 5.99,
    deliveryDays: '3-5 business days'
  },
  EXPRESS: {
    name: 'Express Shipping',
    price: 12.99,
    deliveryDays: '1-2 business days'
  },
  FREE: {
    name: 'Free Shipping',
    price: 0,
    deliveryDays: '5-7 business days',
    minOrder: 50
  }
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'harvest_mood_token',
  USER: 'harvest_mood_user',
  CART: 'harvest_mood_cart',
  THEME: 'harvest_mood_theme',
  LANGUAGE: 'harvest_mood_language',
  PREFERENCES: 'harvest_mood_preferences'
};

// Error messages
export const ERROR_MESSAGES = {
  // Auth errors
  UNAUTHORIZED: 'Please log in to access this resource',
  FORBIDDEN: 'You do not have permission to perform this action',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'Email already registered',
  USER_NOT_FOUND: 'User not found',
  
  // Product errors
  PRODUCT_NOT_FOUND: 'Product not found',
  OUT_OF_STOCK: 'Product is out of stock',
  INSUFFICIENT_STOCK: 'Not enough stock available',
  
  // Order errors
  ORDER_NOT_FOUND: 'Order not found',
  EMPTY_ORDER: 'Order must contain at least one product',
  
  // Cart errors
  CART_ITEM_NOT_FOUND: 'Item not found in cart',
  CART_EMPTY: 'Your cart is empty',
  
  // Review errors
  REVIEW_EXISTS: 'You have already reviewed this product',
  REVIEW_NOT_FOUND: 'Review not found',
  
  // General errors
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Logged in successfully',
  REGISTER_SUCCESS: 'Account created successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  
  // Products
  PRODUCT_CREATED: 'Product created successfully',
  PRODUCT_UPDATED: 'Product updated successfully',
  PRODUCT_DELETED: 'Product deleted successfully',
  
  // Cart
  ADDED_TO_CART: 'Product added to cart',
  REMOVED_FROM_CART: 'Item removed from cart',
  CART_UPDATED: 'Cart updated successfully',
  CART_CLEARED: 'Cart cleared successfully',
  
  // Orders
  ORDER_CREATED: 'Order placed successfully',
  ORDER_CANCELLED: 'Order cancelled successfully',
  
  // Reviews
  REVIEW_CREATED: 'Review submitted successfully',
  REVIEW_UPDATED: 'Review updated successfully',
  REVIEW_DELETED: 'Review deleted successfully'
};

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN: 'Password must be at least 6 characters',
  PASSWORD_COMPLEXITY: 'Password must contain uppercase, lowercase, and number',
  PASSWORD_MATCH: 'Passwords do not match',
  PRICE: 'Please enter a valid price',
  STOCK: 'Please enter a valid stock quantity',
  QUANTITY: 'Please enter a valid quantity',
  PHONE: 'Please enter a valid phone number',
  ZIP_CODE: 'Please enter a valid ZIP code'
};

// App settings
export const APP_SETTINGS = {
  // Pagination
  ITEMS_PER_PAGE: 12,
  
  // Search
  SEARCH_DEBOUNCE: 500,
  
  // Cart
  CART_EXPIRY_DAYS: 7,
  FREE_SHIPPING_MIN: 50,
  
  // Images
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // Reviews
  MIN_REVIEW_LENGTH: 10,
  MAX_REVIEW_LENGTH: 1000
};