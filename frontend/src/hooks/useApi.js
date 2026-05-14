/**
 * useApi Hook
 * Custom hook for making API calls with loading and error states
 */

import { useState, useCallback } from 'react';
import { useNotification } from '../contexts/NotificationContext';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const { showError } = useNotification();

  // Generic API call handler
  const callApi = useCallback(async (apiFunction, options = {}) => {
    const { showSuccessMessage = false, successMessage, errorMessage, onSuccess, onError } = options;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction();
      
      setData(response);
      
      if (showSuccessMessage) {
        const msg = successMessage || response?.message || 'Operation successful';
        // Would need toast here - can be added via notification context
        console.log('Success:', msg);
      }
      
      if (onSuccess) {
        onSuccess(response);
      }
      
      return { success: true, data: response };
    } catch (err) {
      const message = errorMessage || err?.message || 'Operation failed';
      setError(message);
      showError(message);
      
      if (onError) {
        onError(err);
      }
      
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Reset state
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    callApi,
    reset,
    setLoading,
    setError,
    setData
  };
};

// Export individual API hooks for common operations
export const useFetchData = (apiFunction, dependencies = []) => {
  const { callApi, loading, error, data } = useApi();
  
  const fetchData = useCallback(async () => {
    return await callApi(apiFunction);
  }, [apiFunction, callApi]);
  
  return {
    fetchData,
    loading,
    error,
    data
  };
};

export default useApi;