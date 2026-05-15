/**
 * Reset Password Page
 * Allows users to set new password using reset token
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useNotification } from '../../contexts/NotificationContext';
import { validatePassword, validateConfirmPassword } from '../../assets/js/validators';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);
  const [resetComplete, setResetComplete] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: '',
    class: ''
  });
  
  const { showError, showSuccess } = useNotification();
  const navigate = useNavigate();

  // Validate token on load
  useEffect(() => {
    if (!token) {
      setValidToken(false);
      showError('Invalid or missing reset token');
    } else {
      // Verify token with API
      const verifyToken = async () => {
        try {
          // const response = await authAPI.verifyResetToken(token);
          // For now, assume token is valid
          setValidToken(true);
        } catch (error) {
          setValidToken(false);
          showError('Invalid or expired reset link');
        }
      };
      verifyToken();
    }
  }, [token, showError]);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ score: 0, text: '', class: '' });
      return;
    }
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }
    
    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) {
      setErrors({ confirmPassword: confirmError });
      return;
    }
    
    setLoading(true);
    
    try {
      // API call to reset password
      // await authAPI.resetPassword({ token, new_password: formData.password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showSuccess('Password reset successful! Please login with your new password.');
      setResetComplete(true);
      
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      showError(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  // Invalid token state
  if (!validToken) {
    return (
      <>
        <Helmet>
          <title>Invalid Reset Link | UPSC Learning System</title>
        </Helmet>
        
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <i className="fas fa-graduation-cap"></i>
                <span>UPSC PathFinder</span>
              </div>
              <h1 className="auth-title">Invalid Link</h1>
            </div>
            
            <div className="auth-body">
              <div className="text-center">
                <i className="fas fa-exclamation-triangle" style={{ fontSize: '4rem', color: '#e74c3c', marginBottom: '1rem' }}></i>
                <p>The password reset link is invalid or has expired.</p>
                <div className="form-actions">
                  <Link to="/forgot-password" className="btn btn-primary">
                    <span>Request New Link</span>
                  </Link>
                </div>
                <div className="auth-footer">
                  <Link to="/login">Back to Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Reset complete state
  if (resetComplete) {
    return (
      <>
        <Helmet>
          <title>Password Reset | UPSC Learning System</title>
        </Helmet>
        
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <i className="fas fa-graduation-cap"></i>
                <span>UPSC PathFinder</span>
              </div>
              <h1 className="auth-title">Password Reset!</h1>
            </div>
            
            <div className="auth-body">
              <div className="text-center">
                <i className="fas fa-check-circle" style={{ fontSize: '4rem', color: '#27ae60', marginBottom: '1rem' }}></i>
                <p>Your password has been successfully reset.</p>
                <p>Redirecting to login page...</p>
                <div className="form-actions">
                  <Link to="/login" className="btn btn-primary">
                    <span>Go to Login</span>
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
        <title>Reset Password | UPSC Learning System</title>
        <meta name="description" content="Create a new password for your account" />
      </Helmet>
      
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <i className="fas fa-graduation-cap"></i>
              <span>UPSC PathFinder</span>
            </div>
            <h1 className="auth-title">Create New Password</h1>
            <p className="auth-subtitle">Enter your new password below</p>
          </div>
          
          <div className="auth-body">
            <form onSubmit={handleSubmit}>
              {/* New Password field */}
              <div className="form-group">
                <label className="form-label required">New Password</label>
                <div className="input-icon">
                  <i className="fas fa-lock"></i>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter new password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
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
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
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
              
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-key"></i>
                      <span>Reset Password</span>
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

export default ResetPassword;