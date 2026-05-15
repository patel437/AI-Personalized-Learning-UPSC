/**
 * Mock Test Form Component
 * Form for adding mock test results
 */

import React, { useState } from 'react';
import { validateRequired, validateRange } from '../../assets/js/validators';

const MockTestForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    test_name: initialData.test_name || '',
    gs_score: initialData.gs_score || '',
    csat_score: initialData.csat_score || '',
    accuracy: initialData.accuracy || '',
    time_taken: initialData.time_taken || '',
    questions_attempted: initialData.questions_attempted || '',
    correct_answers: initialData.correct_answers || '',
    wrong_answers: initialData.wrong_answers || '',
    test_date: initialData.test_date || new Date().toISOString().split('T')[0]
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.test_name = validateRequired(formData.test_name, 'Test name');
    newErrors.gs_score = validateRange(formData.gs_score, 0, 200, 'GS Score');
    newErrors.csat_score = validateRange(formData.csat_score, 0, 200, 'CSAT Score');
    newErrors.accuracy = formData.accuracy ? validateRange(formData.accuracy, 0, 100, 'Accuracy') : null;
    newErrors.time_taken = formData.time_taken ? validateRange(formData.time_taken, 0, 240, 'Time taken') : null;
    
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null) delete newErrors[key];
    });
    
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
        <label className="form-label required">Test Name</label>
        <input
          type="text"
          name="test_name"
          className={`form-input ${errors.test_name ? 'error' : ''}`}
          value={formData.test_name}
          onChange={handleChange}
          placeholder="e.g., UPSC Prelims 2024 - Test 1"
        />
        {errors.test_name && <div className="error-message">{errors.test_name}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label required">GS Score (out of 200)</label>
          <input
            type="number"
            name="gs_score"
            className={`form-input ${errors.gs_score ? 'error' : ''}`}
            value={formData.gs_score}
            onChange={handleChange}
            placeholder="e.g., 112"
          />
          {errors.gs_score && <div className="error-message">{errors.gs_score}</div>}
        </div>

        <div className="form-group">
          <label className="form-label required">CSAT Score (out of 200)</label>
          <input
            type="number"
            name="csat_score"
            className={`form-input ${errors.csat_score ? 'error' : ''}`}
            value={formData.csat_score}
            onChange={handleChange}
            placeholder="e.g., 85"
          />
          {errors.csat_score && <div className="error-message">{errors.csat_score}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Accuracy (%)</label>
          <input
            type="number"
            name="accuracy"
            className={`form-input ${errors.accuracy ? 'error' : ''}`}
            value={formData.accuracy}
            onChange={handleChange}
            placeholder="e.g., 65"
            step="1"
          />
          {errors.accuracy && <div className="error-message">{errors.accuracy}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Time Taken (minutes)</label>
          <input
            type="number"
            name="time_taken"
            className={`form-input ${errors.time_taken ? 'error' : ''}`}
            value={formData.time_taken}
            onChange={handleChange}
            placeholder="e.g., 120"
          />
          {errors.time_taken && <div className="error-message">{errors.time_taken}</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Questions Attempted</label>
          <input
            type="number"
            name="questions_attempted"
            className="form-input"
            value={formData.questions_attempted}
            onChange={handleChange}
            placeholder="e.g., 85"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Correct Answers</label>
          <input
            type="number"
            name="correct_answers"
            className="form-input"
            value={formData.correct_answers}
            onChange={handleChange}
            placeholder="e.g., 60"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Test Date</label>
        <input
          type="date"
          name="test_date"
          className="form-input"
          value={formData.test_date}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : null}
          <span>Save Test Result</span>
        </button>
      </div>
    </form>
  );
};

export default MockTestForm;