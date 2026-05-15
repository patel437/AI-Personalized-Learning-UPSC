/**
 * ProfileForm Component
 * Form for editing user profile
 */

import React, { useState } from 'react';
import { validatePhone } from '../../assets/js/validators';

const ProfileForm = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    phone: initialData?.phone || '',
    age: initialData?.age || '',
    gender: initialData?.gender || 'Male',
    graduation_stream: initialData?.graduation_stream || 'Arts',
    graduation_percentage: initialData?.graduation_percentage || '',
    preparation_months: initialData?.preparation_months || '',
    daily_study_hours: initialData?.daily_study_hours || 6,
    attempt_number: initialData?.attempt_number || 1,
    previous_prelims_qualified: initialData?.previous_prelims_qualified || false,
    coaching: initialData?.coaching || 'Self Study',
    ncert_read: initialData?.ncert_read || false,
    standard_books: initialData?.standard_books || false,
    target_exam_year: initialData?.target_exam_year || new Date().getFullYear()
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (formData.phone && validatePhone(formData.phone)) {
      newErrors.phone = validatePhone(formData.phone);
    }
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
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input type="text" name="full_name" className="form-input" value={formData.full_name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input type="tel" name="phone" className={`form-input ${errors.phone ? 'error' : ''}`} value={formData.phone} onChange={handleChange} />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Age</label>
          <input type="number" name="age" className="form-input" value={formData.age} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Gender</label>
          <select name="gender" className="form-input" value={formData.gender} onChange={handleChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Graduation Stream</label>
          <select name="graduation_stream" className="form-input" value={formData.graduation_stream} onChange={handleChange}>
            <option value="Arts">Arts</option>
            <option value="Science">Science</option>
            <option value="Commerce">Commerce</option>
            <option value="Engineering">Engineering</option>
            <option value="Medical">Medical</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Graduation %</label>
          <input type="number" name="graduation_percentage" className="form-input" value={formData.graduation_percentage} onChange={handleChange} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Preparation (months)</label>
          <input type="number" name="preparation_months" className="form-input" value={formData.preparation_months} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Daily Study Hours</label>
          <input type="number" name="daily_study_hours" step="0.5" className="form-input" value={formData.daily_study_hours} onChange={handleChange} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Attempt Number</label>
          <input type="number" name="attempt_number" className="form-input" value={formData.attempt_number} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Coaching</label>
          <select name="coaching" className="form-input" value={formData.coaching} onChange={handleChange}>
            <option value="Self Study">Self Study</option>
            <option value="Vajiram">Vajiram</option>
            <option value="Vision IAS">Vision IAS</option>
            <option value="Insights">Insights</option>
            <option value="Forum IAS">Forum IAS</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" name="ncert_read" checked={formData.ncert_read} onChange={handleChange} />
            <span>Read NCERTs</span>
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" name="standard_books" checked={formData.standard_books} onChange={handleChange} />
            <span>Using Standard Books</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : null}
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
};

export default ProfileForm;