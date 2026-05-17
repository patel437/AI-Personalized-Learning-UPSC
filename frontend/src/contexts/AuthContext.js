/**
 * Authentication Context
 * Manages global authentication state
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authHelpers from '../assets/js/auth';
import { storage } from '../assets/js/utils';

// Create context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
  const initAuth = async () => {
    try {
      setLoading(true);
      
      const token = authHelpers.getAccessToken();
      const storedUser = authHelpers.getCurrentUser();
      
      if (token && storedUser) {
        // Double-check expiration before setting authenticated state true
        if (authHelpers.isTokenExpiring()) {
          try {
            await authHelpers.refreshAccessToken();
            setUser(authHelpers.getCurrentUser());
            setIsAuthenticated(true);
            setIsAdmin(authHelpers.getCurrentUser()?.is_admin === true);
          } catch (refreshError) {
            console.error('Automated token refresh failed:', refreshError);
            // Safe fallback clean out to prevent looping
            await authHelpers.logout();
            setUser(null);
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } else {
          setUser(storedUser);
          setIsAuthenticated(true);
          setIsAdmin(storedUser.is_admin === true);
        }
      } else {
        // Ensure explicitly false if storage variables are blank
        setIsAuthenticated(false);
      }
    } catch (globalAuthError) {
      console.error("Auth initialization error caught:", globalAuthError);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // Only release routing guard when all states are resolved
    }
  };
  
  initAuth();
}, []);

  // Login handler
  const handleLogin = useCallback(async (usernameOrEmail, password) => {
    setLoading(true);
    
    const result = await authHelpers.login(usernameOrEmail, password);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
      setIsAdmin(result.user.is_admin === true);
      setLoading(false);
      return { success: true };
    }
    
    setLoading(false);
    return { success: false, error: result.error };
  }, []);

  // Register handler
  const handleRegister = useCallback(async (userData) => {
    setLoading(true);
    
    const result = await authHelpers.register(userData);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
      setIsAdmin(result.user.is_admin === true);
      setLoading(false);
      return { success: true };
    }
    
    setLoading(false);
    return { success: false, error: result.error };
  }, []);

  // Logout handler
  const handleLogout = useCallback(async () => {
    setLoading(true);
    
    await authHelpers.logout();
    
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    setLoading(false);
    
    navigate('/login');
  }, [navigate]);

  // Update profile handler
  const handleUpdateProfile = useCallback(async (profileData) => {
    setLoading(true);
    
    const result = await authHelpers.updateProfile(profileData);
    
    if (result.success) {
      setUser(result.user);
      setLoading(false);
      return { success: true };
    }
    
    setLoading(false);
    return { success: false, error: result.error };
  }, []);

  // Change password handler
  const handleChangePassword = useCallback(async (currentPassword, newPassword) => {
    const result = await authHelpers.changePassword(currentPassword, newPassword);
    return result;
  }, []);

  // Save student profile handler
  const [studentProfile, setStudentProfile] = useState(null);
  
  const loadStudentProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await import('../assets/js/api').then(api => api.authAPI.getStudentProfile());
      if (response?.data?.student_profile) {
        setStudentProfile(response.data.student_profile);
        storage.set('student_profile', response.data.student_profile);
      }
    } catch (error) {
      console.error('Failed to load student profile:', error);
    }
  }, [isAuthenticated]);

  // Load student profile when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadStudentProfile();
    }
  }, [isAuthenticated, loadStudentProfile]);

  // Context value
  const value = {
    user,
    studentProfile,
    loading,
    isAuthenticated,
    isAdmin,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    loadStudentProfile,
    setStudentProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;