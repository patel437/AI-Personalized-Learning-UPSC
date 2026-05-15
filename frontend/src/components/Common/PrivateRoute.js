/**
 * PrivateRoute Component
 * Protects routes that require authentication
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Show loader while checking authentication
  if (loading) {
    return <Loader fullScreen />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin access
  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;