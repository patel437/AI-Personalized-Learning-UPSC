/**
 * useWindowSize Hook
 * Custom hook for tracking window dimensions
 */

import { useState, useEffect, useCallback } from 'react';

export const useWindowSize = () => {
  // Initialize with window dimensions
  const getWindowSize = useCallback(() => ({
    width: window.innerWidth,
    height: window.innerHeight
  }), []);
  
  const [windowSize, setWindowSize] = useState(getWindowSize);
  
  useEffect(() => {
    let timeoutId = null;
    
    const handleResize = () => {
      // Debounce resize events
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        setWindowSize(getWindowSize());
      }, 150);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [getWindowSize]);
  
  // Helper booleans for responsive design
  const isMobile = windowSize.width < 576;
  const isTablet = windowSize.width >= 576 && windowSize.width < 768;
  const isDesktop = windowSize.width >= 768 && windowSize.width < 1024;
  const isLargeDesktop = windowSize.width >= 1024;
  
  return {
    ...windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop
  };
};

export default useWindowSize;