/**
 * Authentication Helpers
 * Token management and auth state helpers
 */

import { storage, session } from './utils';
import api, { authAPI } from './api';

// Token keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';
const AUTH_CHECK_KEY = 'auth_check_time';

// Token expiration buffer (5 minutes in milliseconds)
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000;

/**
 * Save authentication data
 */
export const setAuthData = (accessToken, refreshToken, user) => {
  storage.set(ACCESS_TOKEN_KEY, accessToken);
  storage.set(REFRESH_TOKEN_KEY, refreshToken);
  storage.set(USER_KEY, user);
  storage.set(AUTH_CHECK_KEY, Date.now());
  
  // Also store in session for quick access
  session.set(ACCESS_TOKEN_KEY, accessToken);
  session.set(USER_KEY, user);
};

/**
 * Clear authentication data (logout)
 */
export const clearAuthData = () => {
  storage.remove(ACCESS_TOKEN_KEY);
  storage.remove(REFRESH_TOKEN_KEY);
  storage.remove(USER_KEY);
  storage.remove(AUTH_CHECK_KEY);
  
  session.remove(ACCESS_TOKEN_KEY);
  session.remove(USER_KEY);
};

/**
 * Get access token
 */
export const getAccessToken = () => {
  return storage.get(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token
 */
export const getRefreshToken = () => {
  return storage.get(REFRESH_TOKEN_KEY);
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return storage.get(USER_KEY);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token;
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.is_admin === true;
};

/**
 * Check if token is expired or about to expire
 */
export const isTokenExpiring = () => {
  // This is a simplified check
  // In production, you'd decode JWT and check exp claim
  const authTime = storage.get(AUTH_CHECK_KEY);
  if (!authTime) return true;
  
  // Consider token expired after 23 hours (assuming 24 hour expiry)
  const tokenAge = Date.now() - authTime;
  return tokenAge > (23 * 60 * 60 * 1000);
};

/**
 * Refresh the access token
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    
    const response = await authAPI.refreshToken();
    
    if (response?.data?.access_token) {
      storage.set(ACCESS_TOKEN_KEY, response.data.access_token);
      session.set(ACCESS_TOKEN_KEY, response.data.access_token);
      storage.set(AUTH_CHECK_KEY, Date.now());
      return response.data.access_token;
    }
    
    throw new Error('Refresh failed');
  } catch (error) {
    clearAuthData();
    throw error;
  }
};

/**
 * Login user
 */
export const login = async (usernameOrEmail, password) => {
  try {
    const response = await authAPI.login({ username_or_email: usernameOrEmail, password });
    
    if (response?.data) {
      const { access_token, refresh_token, user } = response.data;
      setAuthData(access_token, refresh_token, user);
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid response' };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Login failed'
    };
  }
};

/**
 * Register user
 */
export const register = async (userData) => {
  try {
    const response = await authAPI.register(userData);
    
    if (response?.data) {
      const { access_token, refresh_token, user } = response.data;
      setAuthData(access_token, refresh_token, user);
      return { success: true, user };
    }
    
    return { success: false, error: 'Invalid response' };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Registration failed'
    };
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await authAPI.logout();
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    clearAuthData();
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await authAPI.updateProfile(profileData);
    
    if (response?.data?.user) {
      const currentUser = getCurrentUser();
      const updatedUser = { ...currentUser, ...response.data.user };
      storage.set(USER_KEY, updatedUser);
      session.set(USER_KEY, updatedUser);
      return { success: true, user: updatedUser };
    }
    
    return { success: false, error: 'Update failed' };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Profile update failed'
    };
  }
};

/**
 * Change password
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    await authAPI.changePassword({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: newPassword
    });
    
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error?.message || 'Password change failed'
    };
  }
};

/**
 * Check auth status and refresh if needed
 */
export const checkAuthStatus = async () => {
  if (!isAuthenticated()) {
    return false;
  }
  
  if (isTokenExpiring()) {
    try {
      await refreshAccessToken();
      return true;
    } catch (error) {
      clearAuthData();
      return false;
    }
  }
  
  return true;
};

// Export all auth helpers
export default {
  setAuthData,
  clearAuthData,
  getAccessToken,
  getRefreshToken,
  getCurrentUser,
  isAuthenticated,
  isAdmin,
  isTokenExpiring,
  refreshAccessToken,
  login,
  register,
  logout,
  updateProfile,
  changePassword,
  checkAuthStatus
};