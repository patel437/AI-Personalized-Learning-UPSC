/**
 * Notification Context
 * Manages toast notifications and alerts
 */

import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';

// Create context
const NotificationContext = createContext(null);

// Custom hook to use notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  // Success notification
  const showSuccess = useCallback((message, options = {}) => {
    toast.success(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }, []);
  
  // Error notification
  const showError = useCallback((message, options = {}) => {
    toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }, []);
  
  // Warning notification
  const showWarning = useCallback((message, options = {}) => {
    toast.warning(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }, []);
  
  // Info notification
  const showInfo = useCallback((message, options = {}) => {
    toast.info(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  }, []);
  
  // Loading notification (returns a toast ID for updating)
  const showLoading = useCallback((message = 'Loading...', options = {}) => {
    return toast.loading(message, {
      position: 'top-right',
      ...options
    });
  }, []);
  
  // Update loading notification
  const updateLoading = useCallback((toastId, message, type = 'success') => {
    toast.update(toastId, {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 3000
    });
  }, []);
  
  // Dismiss notification
  const dismiss = useCallback((toastId) => {
    toast.dismiss(toastId);
  }, []);
  
  // Dismiss all notifications
  const dismissAll = useCallback(() => {
    toast.dismiss();
  }, []);
  
  // API error handler
  const handleApiError = useCallback((error, defaultMessage = 'Something went wrong') => {
    console.error('API Error:', error);
    
    const message = error?.message || error?.error || defaultMessage;
    showError(message);
    
    return message;
  }, [showError]);
  
  // Success handler for API responses
  const handleApiSuccess = useCallback((data, defaultMessage = 'Operation successful') => {
    const message = data?.message || defaultMessage;
    showSuccess(message);
    return message;
  }, [showSuccess]);
  
  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    updateLoading,
    dismiss,
    dismissAll,
    handleApiError,
    handleApiSuccess
  };
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;