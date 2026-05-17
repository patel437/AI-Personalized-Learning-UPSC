/**
 * Mock Test Form Component
 * Form for adding mock test results (Supports standalone GS or CSAT input)
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
    if (name === 'gs_score' || name === 'csat_score') {
      setErrors(prev => ({ ...prev, gs_score: '', csat_score: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    newErrors.test_name = validateRequired(formData.test_name, 'Test name');
    
    if (!formData.gs_score && !formData.csat_score) {
      newErrors.gs_score = 'Please fill out either GS Score or CSAT Score';
      newErrors.csat_score = 'Please fill out either GS Score or CSAT Score';
    } else {
      if (formData.gs_score !== '') {
        const gsErr = validateRange(formData.gs_score, 0, 200, 'GS Score');
        if (gsErr) newErrors.gs_score = gsErr;
      }
      if (formData.csat_score !== '') {
        const csatErr = validateRange(formData.csat_score, 0, 200, 'CSAT Score');
        if (csatErr) newErrors.csat_score = csatErr;
      }
    }
    
    if (formData.accuracy) {
      newErrors.accuracy = validateRange(formData.accuracy, 0, 100, 'Accuracy');
    }
    if (formData.time_taken) {
      newErrors.time_taken = validateRange(formData.time_taken, 0, 240, 'Time taken');
    }
    
    Object.keys(newErrors).forEach(key => {
      if (newErrors[key] === null || newErrors[key] === undefined || newErrors[key] === '') {
        delete newErrors[key];
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);

    // Dynamic scrubbing: core marks can be null, metrics default cleanly to empty strings/0
    const cleanedPayload = {
      test_name: formData.test_name,
      gs_score: formData.gs_score === '' ? null : Number(formData.gs_score),
      csat_score: formData.csat_score === '' ? null : Number(formData.csat_score),
      accuracy: formData.accuracy === '' ? '' : Number(formData.accuracy),
      time_taken: formData.time_taken === '' ? '' : Number(formData.time_taken),
      questions_attempted: formData.questions_attempted === '' ? '' : Number(formData.questions_attempted),
      correct_answers: formData.correct_answers === '' ? '' : Number(formData.correct_answers),
      wrong_answers: formData.wrong_answers === '' ? '' : Number(formData.wrong_answers),
      test_date: formData.test_date
    };
    
    await onSubmit(cleanedPayload);
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
          placeholder="e.g., UPSC Prelims 2026 - Sectional Test 1"
        />
        {errors.test_name && <div className="error-message">{errors.test_name}</div>}
      </div>

      <p className="form-note" style={{ fontSize: '12px', color: '#7f8c8d', margin: '-5px 0 15px 0' }}>
        * Note: You can submit either a GS score, a CSAT score, or both together.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">GS Score (out of 200)</label>
          <input
            type="number"
            name="gs_score"
            className={`form-input ${errors.gs_score ? 'error' : ''}`}
            value={formData.gs_score}
            onChange={handleChange}
            placeholder="Leave blank if not taken"
          />
          {errors.gs_score && <div className="error-message">{errors.gs_score}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">CSAT Score (out of 200)</label>
          <input
            type="number"
            name="csat_score"
            className={`form-input ${errors.csat_score ? 'error' : ''}`}
            value={formData.csat_score}
            onChange={handleChange}
            placeholder="Leave blank if not taken"
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
          {loading ? <i className="fas fa-spinner fa-spin" style={{ marginRight: '5px' }}></i> : null}
          <span>Save Test Result</span>
        </button>
      </div>
    </form>
  );
};

export default MockTestForm;