/**
 * useAuth Hook
 * Custom hook for accessing authentication state and methods
 */

import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Re-export the auth context hook for easier imports
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;