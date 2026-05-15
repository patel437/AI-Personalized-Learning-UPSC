/**
 * Forgot Password Page
 * Allows users to request password reset link
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNotification } from '../../contexts/NotificationContext';
import { validateEmail } from '../../assets/js/validators';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { showError, showSuccess } = useNotification();

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      return;
    }
    
    setLoading(true);
    
    try {
      // API call to request password reset
      // const response = await authAPI.forgotPassword({ email });
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Password reset link sent to your email!');
      setSubmitted(true);
    } catch (error) {
      showError(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Reset Link Sent | UPSC Learning System</title>
        </Helmet>
        
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <i className="fas fa-graduation-cap"></i>
                <span>UPSC PathFinder</span>
              </div>
              <h1 className="auth-title">Check Your Email</h1>
            </div>
            
            <div className="auth-body">
              <div className="text-center">
                <i className="fas fa-envelope-open-text" style={{ fontSize: '4rem', color: '#27ae60', marginBottom: '1rem' }}></i>
                <p>We've sent a password reset link to:</p>
                <p><strong>{email}</strong></p>
                <p className="text-muted">Please check your email and click the link to reset your password.</p>
                <div className="form-actions">
                  <Link to="/login" className="btn btn-primary">
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Login</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Forgot Password | UPSC Learning System</title>
        <meta name="description" content="Reset your UPSC Learning System password" />
      </Helmet>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-graduation-cap"></i>
              <span>UPSC PathFinder</span>
            </div>
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">Enter your email to receive a reset link</p>
          </div>
          
          <div className="auth-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label required">Email Address</label>
                <div className="input-icon">
                  <i className="fas fa-envelope"></i>
                  <input
                    type="email"
                    className={`form-input ${errors.email ? 'error' : ''}`}
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
                {errors.email && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane"></i>
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="auth-footer">
                <Link to="/login">
                  <i className="fas fa-arrow-left"></i>
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;