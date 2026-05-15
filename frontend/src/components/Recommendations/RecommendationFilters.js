/**
 * RecommendationFilters Component
 * Filter controls for recommendations
 */

import React from 'react';

const RecommendationFilters = ({ filters, onFilterChange, recommendations }) => {
  // Get unique subjects from recommendations
  const getUniqueSubjects = () => {
    const subjects = new Set();
    recommendations.forEach(rec => {
      if (rec.subject) subjects.add(rec.subject);
    });
    return Array.from(subjects);
  };

  const priorityOptions = [
    { value: 'all', label: 'All Priorities', icon: 'fas fa-filter' },
    { value: 'high', label: 'High Priority', icon: 'fas fa-exclamation-circle' },
    { value: 'medium', label: 'Medium Priority', icon: 'fas fa-chart-line' },
    { value: 'low', label: 'Low Priority', icon: 'fas fa-check-circle' }
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types', icon: 'fas fa-list' },
    { value: 'study_plan', label: 'Study Plans', icon: 'fas fa-calendar-alt' },
    { value: 'resource', label: 'Resources', icon: 'fas fa-book' },
    { value: 'strategy', label: 'Strategies', icon: 'fas fa-lightbulb' },
    { value: 'weakness_alert', label: 'Weakness Alerts', icon: 'fas fa-exclamation-triangle' }
  ];

  const subjectOptions = [
    { value: 'all', label: 'All Subjects', icon: 'fas fa-globe' },
    ...getUniqueSubjects().map(subject => ({
      value: subject,
      label: subject,
      icon: 'fas fa-graduation-cap'
    }))
  ];

  const handleFilterChange = (filterType, value) => {
    onFilterChange({
      ...filters,
      [filterType]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({
      priority: 'all',
      type: 'all',
      subject: 'all'
    });
  };

  const isFilterActive = filters.priority !== 'all' || filters.type !== 'all' || filters.subject !== 'all';

  return (
    <div className="recommendation-filters">
      <div className="filters-header">
        <h4>
          <i className="fas fa-sliders-h"></i>
          <span>Filter Recommendations</span>
        </h4>
        {isFilterActive && (
          <button className="btn-link" onClick={clearFilters}>
            <i className="fas fa-times"></i>
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="filters-group">
        {/* Priority Filter */}
        <div className="filter-section">
          <label className="filter-label">Priority</label>
          <div className="filter-options">
            {priorityOptions.map(option => (
              <button
                key={option.value}
                className={`filter-btn ${filters.priority === option.value ? 'active' : ''}`}
                onClick={() => handleFilterChange('priority', option.value)}
              >
                <i className={option.icon}></i>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="filter-section">
          <label className="filter-label">Type</label>
          <div className="filter-options">
            {typeOptions.map(option => (
              <button
                key={option.value}
                className={`filter-btn ${filters.type === option.value ? 'active' : ''}`}
                onClick={() => handleFilterChange('type', option.value)}
              >
                <i className={option.icon}></i>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter */}
        {subjectOptions.length > 1 && (
          <div className="filter-section">
            <label className="filter-label">Subject</label>
            <div className="filter-options scrollable">
              {subjectOptions.map(option => (
                <button
                  key={option.value}
                  className={`filter-btn ${filters.subject === option.value ? 'active' : ''}`}
                  onClick={() => handleFilterChange('subject', option.value)}
                >
                  <i className={option.icon}></i>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationFilters;