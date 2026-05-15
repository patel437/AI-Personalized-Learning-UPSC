/**
 * Login Form Component
 * Handles user login with email/username and password
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { validateLogin } from '../../assets/js/validators';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state
  const from = location.state?.from?.pathname || '/dashboard';

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setLoading(true);
    
    // Attempt login
    const result = await login(formData.usernameOrEmail, formData.password);
    
    if (result.success) {
      showSuccess('Login successful! Redirecting...');
      navigate(from, { replace: true });
    } else {
      showError(result.error || 'Invalid username/email or password');
      setErrors({ general: result.error || 'Invalid credentials' });
    }
    
    setLoading(false);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {/* General error message */}
      {errors.general && (
        <div className="error-message general-error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{errors.general}</span>
        </div>
      )}
      
      {/* Username/Email field */}
      <div className="form-group">
        <label className="form-label required">Username or Email</label>
        <div className="input-icon">
          <i className="fas fa-envelope"></i>
          <input
            type="text"
            name="usernameOrEmail"
            className={`form-input ${errors.usernameOrEmail ? 'error' : ''}`}
            placeholder="Enter your username or email"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            disabled={loading}
            autoComplete="username"
          />
        </div>
        {errors.usernameOrEmail && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errors.usernameOrEmail}</span>
          </div>
        )}
      </div>
      
      {/* Password field */}
      <div className="form-group">
        <label className="form-label required">Password</label>
        <div className="input-icon">
          <i className="fas fa-lock"></i>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={togglePasswordVisibility}
            tabIndex="-1"
          >
            <i className={`fas fa-${showPassword ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {errors.password && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errors.password}</span>
          </div>
        )}
      </div>
      
      {/* Forgot password link */}
      <div className="form-group text-right">
        <Link to="/forgot-password" className="forgot-link">
          Forgot Password?
        </Link>
      </div>
      
      {/* Submit button */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </>
          )}
        </button>
      </div>
      
      {/* Register link */}
      <div className="auth-footer">
        Don't have an account?{' '}
        <Link to="/register">Create an account</Link>
      </div>
    </form>
  );
};

export default LoginForm;