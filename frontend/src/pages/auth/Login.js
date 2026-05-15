/**
 * Login Page
 * Displays login form and handles authentication
 */

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LoginForm from '../../components/Forms/LoginForm';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Login | UPSC Learning System</title>
        <meta name="description" content="Login to your UPSC Learning System account" />
      </Helmet>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-graduation-cap"></i>
              <span>UPSC PathFinder</span>
            </div>
            <h1 className="auth-title">Welcome Back!</h1>
            <p className="auth-subtitle">Login to continue your UPSC preparation journey</p>
          </div>
          
          <div className="auth-body">
            <LoginForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;