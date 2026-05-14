/**
 * useLocalStorage Hook
 * Custom hook for managing localStorage state
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../assets/js/utils';

export const useLocalStorage = (key, initialValue) => {
  // Get stored value
  const getStoredValue = useCallback(() => {
    try {
      const item = storage.get(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);
  
  const [storedValue, setStoredValue] = useState(getStoredValue);
  
  // Update localStorage when state changes
  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      storage.set(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);
  
  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      storage.remove(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);
  
  // Sync across tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
        setStoredValue(newValue);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);
  
  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;