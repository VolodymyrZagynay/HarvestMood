import jwt_decode from 'jwt-decode';
import { STORAGE_KEYS } from './constants';

/**
 * Get token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Set token in localStorage
 */
export const setToken = (token) => {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
};

/**
 * Remove token from localStorage
 */
export const removeToken = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
};

/**
 * Decode JWT token
 */
export const decodeToken = (token) => {
  try {
    return jwt_decode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token && !isTokenExpired(token);
};

/**
 * Get user ID from token
 */
export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.UserId || null;
};

/**
 * Get user role from token
 */
export const getUserRoleFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.Role || null;
};

/**
 * Get user data from localStorage
 */
export const getUser = () => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting user from storage:', error);
    return null;
  }
};

/**
 * Set user data in localStorage
 */
export const setUser = (user) => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

/**
 * Remove user data from localStorage
 */
export const removeUser = () => {
  localStorage.removeItem(STORAGE_KEYS.USER);
};

/**
 * Login user (set token and user data)
 */
export const login = (token, user) => {
  setToken(token);
  setUser(user);
};

/**
 * Logout user (remove token and user data)
 */
export const logout = () => {
  removeToken();
  removeUser();
};

/**
 * Check if user has specific role
 */
export const hasRole = (role) => {
  const userRole = getUserRoleFromToken();
  return userRole === role;
};

/**
 * Check if user is farmer
 */
export const isFarmer = () => {
  return hasRole('Farmer');
};

/**
 * Check if user is customer
 */
export const isCustomer = () => {
  return hasRole('Customer');
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Verify token and get user data
 */
export const verifyToken = async () => {
  const token = getToken();
  
  if (!token || isTokenExpired(token)) {
    logout();
    return null;
  }
  
  const user = getUser();
  if (!user) {
    logout();
    return null;
  }
  
  return user;
};