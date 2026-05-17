/**
 * Study Log Form Component
 * Form for logging daily study hours with standard subject mapping translation
 */

import React, { useState } from 'react';
import { validateRequired, validateStudyHours } from '../../assets/js/validators';

const SUBJECTS = [
  'History', 'Geography', 'Polity', 'Economy',
  'Science & Tech', 'Environment', 'Current Affairs', 'Art & Culture',
  'Comprehension', 'Logical Reasoning', 'Quantitative Aptitude',
  'Data Interpretation', 'Decision Making'
];

// FIXED: Exact translation mapping dictionary from Frontend UI labels to Backend canonical keys
const SUBJECT_MAP = {
  'History': 'history',
  'Geography': 'geography',
  'Polity': 'polity',
  'Economy': 'economy',
  'Science & Tech': 'science_tech',
  'Environment': 'environment',
  'Current Affairs': 'current_affairs',
  'Art & Culture': 'art_culture',
  'Comprehension': 'comprehension',
  'Logical Reasoning': 'logical_reasoning',
  'Quantitative Aptitude': 'quantitative',
  'Data Interpretation': 'data_interpretation',
  'Decision Making': 'decision_making'
};

const StudyLogForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const formatInitialDate = () => {
    if (!initialData.log_date) return new Date().toISOString().split('T')[0];
    const d = new Date(initialData.log_date);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    log_date: formatInitialDate(),
    study_hours: initialData.study_hours || '',
    subjects_studied: initialData.subjects_studied || [],
    quizzes_taken: initialData.quizzes_taken || 0,
    notes_taken: initialData.notes_taken || false
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

  const handleSubjectToggle = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects_studied: prev.subjects_studied.includes(subject)
        ? prev.subjects_studied.filter(s => s !== subject)
        : [...prev.subjects_studied, subject]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.log_date = validateRequired(formData.log_date, 'Date');
    newErrors.study_hours = validateStudyHours(formData.study_hours);
    
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

    // FIXED: Convert UI selected labels to clear lowercase canonical strings for the database
    const backendMappedSubjects = formData.subjects_studied.map(
      uiLabel => SUBJECT_MAP[uiLabel] || uiLabel.toLowerCase()
    );

    const sanitizedPayload = {
      ...formData,
      study_hours: parseFloat(formData.study_hours),
      quizzes_taken: parseInt(formData.quizzes_taken, 10) || 0,
      subjects_studied: backendMappedSubjects // Swapped to use sanitized backend strings
    };

    await onSubmit(sanitizedPayload);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-group">
        <label className="form-label required">Date</label>
        <input
          type="date"
          name="log_date"
          className={`form-input ${errors.log_date ? 'error' : ''}`}
          value={formData.log_date}
          onChange={handleChange}
        />
        {errors.log_date && <div className="error-message">{errors.log_date}</div>}
      </div>

      <div className="form-group">
        <label className="form-label required">Study Hours</label>
        <input
          type="number"
          name="study_hours"
          className={`form-input ${errors.study_hours ? 'error' : ''}`}
          value={formData.study_hours}
          onChange={handleChange}
          placeholder="e.g., 5.5"
          step="0.5"
        />
        {errors.study_hours && <div className="error-message">{errors.study_hours}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">Subjects Studied</label>
        <div className="subjects-grid">
          {SUBJECTS.map(subject => (
            <label key={subject} className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.subjects_studied.includes(subject)}
                onChange={() => handleSubjectToggle(subject)}
              />
              <span>{subject}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Quizzes Taken</label>
          <input
            type="number"
            name="quizzes_taken"
            className="form-input"
            value={formData.quizzes_taken}
            onChange={handleChange}
            min="0"
            max="20"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label" style={{ marginTop: '35px', display: 'block' }}>
            <input
              type="checkbox"
              name="notes_taken"
              checked={formData.notes_taken}
              onChange={handleChange}
            />
            <span>Took Notes</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : null}
          <span>Save Study Log</span>
        </button>
      </div>
    </form>
  );
};

export default StudyLogForm;