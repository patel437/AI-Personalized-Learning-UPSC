/**
 * Register Form Component
 * Handles new user registration
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { validateRegistration, validatePassword } from '../../assets/js/validators';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: '',
    class: ''
  });
  
  const { register } = useAuth();
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, text: '', class: '' });
      return;
    }
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character variety
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    // Determine strength level
    let text = '';
    let classname = '';
    
    if (score <= 2) {
      text = 'Weak';
      classname = 'weak';
    } else if (score <= 4) {
      text = 'Medium';
      classname = 'medium';
    } else if (score <= 6) {
      text = 'Strong';
      classname = 'strong';
    } else {
      text = 'Very Strong';
      classname = 'very-strong';
    }
    
    setPasswordStrength({
      score: Math.min(100, (score / 8) * 100),
      text,
      class: classname
    });
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Calculate password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateRegistration(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    
    setLoading(true);
    
    // Prepare data for API
    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      full_name: formData.fullName,
      phone: formData.phone
    };
    
    // Attempt registration
    const result = await register(userData);
    
    if (result.success) {
      showSuccess('Registration successful! Redirecting to dashboard...');
      navigate('/dashboard');
    } else {
      showError(result.error || 'Registration failed');
      setErrors({ general: result.error || 'Registration failed' });
    }
    
    setLoading(false);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
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
      
      {/* Username field */}
      <div className="form-group">
        <label className="form-label required">Username</label>
        <div className="input-icon">
          <i className="fas fa-user"></i>
          <input
            type="text"
            name="username"
            className={`form-input ${errors.username ? 'error' : ''}`}
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
            autoComplete="username"
          />
        </div>
        {errors.username && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errors.username}</span>
          </div>
        )}
        <small className="form-hint">3-50 characters, letters, numbers, and underscores only</small>
      </div>
      
      {/* Email field */}
      <div className="form-group">
        <label className="form-label required">Email Address</label>
        <div className="input-icon">
          <i className="fas fa-envelope"></i>
          <input
            type="email"
            name="email"
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            autoComplete="email"
          />
        </div>
        {errors.email && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errors.email}</span>
          </div>
        )}
      </div>
      
      {/* Full Name field (optional) */}
      <div className="form-group">
        <label className="form-label">Full Name (Optional)</label>
        <div className="input-icon">
          <i className="fas fa-id-card"></i>
          <input
            type="text"
            name="fullName"
            className="form-input"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
            autoComplete="name"
          />
        </div>
      </div>
      
      {/* Phone field (optional) */}
      <div className="form-group">
        <label className="form-label">Phone Number (Optional)</label>
        <div className="input-icon">
          <i className="fas fa-phone"></i>
          <input
            type="tel"
            name="phone"
            className={`form-input ${errors.phone ? 'error' : ''}`}
            placeholder="10-digit mobile number"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            autoComplete="tel"
          />
        </div>
        {errors.phone && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errors.phone}</span>
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
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            autoComplete="new-password"
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
        
        {/* Password strength indicator */}
        {formData.password && (
          <div className="password-strength">
            <div className="strength-bar">
              <div 
                className={`strength-fill ${passwordStrength.class}`}
                style={{ width: `${passwordStrength.score}%` }}
              ></div>
            </div>
            <span className="strength-text">
              Password strength: {passwordStrength.text}
            </span>
          </div>
        )}
        
        <small className="form-hint">
          At least 8 characters with uppercase, lowercase, and number
        </small>
      </div>
      
      {/* Confirm Password field */}
      <div className="form-group">
        <label className="form-label required">Confirm Password</label>
        <div className="input-icon">
          <i className="fas fa-lock"></i>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="toggle-password"
            onClick={toggleConfirmPasswordVisibility}
            tabIndex="-1"
          >
            <i className={`fas fa-${showConfirmPassword ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {errors.confirmPassword && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errors.confirmPassword}</span>
          </div>
        )}
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
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <i className="fas fa-user-plus"></i>
              <span>Create Account</span>
            </>
          )}
        </button>
      </div>
      
      {/* Login link */}
      <div className="auth-footer">
        Already have an account?{' '}
        <Link to="/login">Sign in</Link>
      </div>
    </form>
  );
};

export default RegisterForm;