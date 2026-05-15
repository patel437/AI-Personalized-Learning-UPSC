/**
 * Register Page
 * Displays registration form for new users
 */

import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import RegisterForm from '../../components/Forms/RegisterForm';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const { isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Helmet>
        <title>Register | UPSC Learning System</title>
        <meta name="description" content="Create your UPSC Learning System account" />
      </Helmet>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-graduation-cap"></i>
              <span>UPSC PathFinder</span>
            </div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Start your personalized UPSC preparation journey</p>
          </div>
          
          <div className="auth-body">
            <RegisterForm />
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;