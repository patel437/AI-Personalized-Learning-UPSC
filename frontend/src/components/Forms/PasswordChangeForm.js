/**
 * PasswordChangeForm Component
 * Form for changing user password
 */

import React, { useState } from 'react';
import { validatePassword, validateConfirmPassword } from '../../assets/js/validators';

const PasswordChangeForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) newErrors.newPassword = passwordError;
    const confirmError = validateConfirmPassword(formData.newPassword, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label className="form-label required">Current Password</label>
        <div className="input-icon">
          <i className="fas fa-lock"></i>
          <input type={showCurrent ? 'text' : 'password'} name="currentPassword" className={`form-input ${errors.currentPassword ? 'error' : ''}`} value={formData.currentPassword} onChange={handleChange} />
          <button type="button" className="toggle-password" onClick={() => setShowCurrent(!showCurrent)}>
            <i className={`fas fa-${showCurrent ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
      </div>

      <div className="form-group">
        <label className="form-label required">New Password</label>
        <div className="input-icon">
          <i className="fas fa-lock"></i>
          <input type={showNew ? 'text' : 'password'} name="newPassword" className={`form-input ${errors.newPassword ? 'error' : ''}`} value={formData.newPassword} onChange={handleChange} />
          <button type="button" className="toggle-password" onClick={() => setShowNew(!showNew)}>
            <i className={`fas fa-${showNew ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
        <small className="form-hint">At least 8 characters with uppercase, lowercase, and number</small>
      </div>

      <div className="form-group">
        <label className="form-label required">Confirm New Password</label>
        <div className="input-icon">
          <i className="fas fa-lock"></i>
          <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" className={`form-input ${errors.confirmPassword ? 'error' : ''}`} value={formData.confirmPassword} onChange={handleChange} />
          <button type="button" className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
            <i className={`fas fa-${showConfirm ? 'eye-slash' : 'eye'}`}></i>
          </button>
        </div>
        {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : null}
          <span>Change Password</span>
        </button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;