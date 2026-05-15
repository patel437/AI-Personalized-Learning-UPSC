/**
 * RecommendationCard Component
 * Individual recommendation card with details and actions
 */

import React from 'react';
import { formatDate } from '../../assets/js/utils';

const RecommendationCard = ({ recommendation, isExpanded, onToggle, onAction }) => {
  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <i className="fas fa-exclamation-circle"></i>;
      case 'medium':
        return <i className="fas fa-chart-line"></i>;
      case 'low':
        return <i className="fas fa-check-circle"></i>;
      default:
        return <i className="fas fa-info-circle"></i>;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#3498db';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'study_plan':
        return <i className="fas fa-calendar-alt"></i>;
      case 'resource':
        return <i className="fas fa-book"></i>;
      case 'strategy':
        return <i className="fas fa-lightbulb"></i>;
      case 'weakness_alert':
        return <i className="fas fa-exclamation-triangle"></i>;
      default:
        return <i className="fas fa-graduation-cap"></i>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'viewed':
        return <span className="badge badge-info">Viewed</span>;
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      default:
        return null;
    }
  };

  const handleAction = (action) => {
    onAction(recommendation.id, action);
  };

  return (
    <div className={`recommendation-card priority-${recommendation.priority || 'medium'}`}>
      <div className="card-header" onClick={onToggle}>
        <div className="header-left">
          <div className="priority-icon" style={{ color: getPriorityColor(recommendation.priority) }}>
            {getPriorityIcon(recommendation.priority)}
          </div>
          <div className="recommendation-info">
            <h4 className="recommendation-title">
              {recommendation.recommendation_type === 'weakness_alert' && (
                <span className="subject-tag">{recommendation.subject}</span>
              )}
              {recommendation.recommendation_type === 'study_plan' && 'Study Plan Update'}
              {recommendation.recommendation_type === 'resource' && 'Recommended Resource'}
              {recommendation.recommendation_type === 'strategy' && 'Study Strategy'}
              {!recommendation.recommendation_type && 'Personalized Recommendation'}
            </h4>
            <div className="recommendation-meta">
              <span className="meta-item">
                {getTypeIcon(recommendation.recommendation_type)}
                <span>{recommendation.recommendation_type || 'General'}</span>
              </span>
              <span className="meta-item">
                <i className="fas fa-calendar"></i>
                <span>{formatDate(recommendation.created_at)}</span>
              </span>
              {getStatusBadge(recommendation.status)}
            </div>
          </div>
        </div>
        <div className="header-right">
          <button className="expand-btn">
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="card-body">
          <div className="recommendation-content">
            <p>{recommendation.content}</p>
          </div>

          {/* Resources section if available */}
          {recommendation.resources && recommendation.resources.length > 0 && (
            <div className="resources-section">
              <h5>Recommended Resources:</h5>
              <ul className="resources-list">
                {recommendation.resources.map((resource, idx) => (
                  <li key={idx}>
                    <i className="fas fa-link"></i>
                    <span>{resource.title || resource}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            {recommendation.status === 'pending' && (
              <>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => handleAction('view')}
                >
                  <i className="fas fa-eye"></i>
                  <span>Mark as Viewed</span>
                </button>
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => handleAction('complete')}
                >
                  <i className="fas fa-check"></i>
                  <span>Mark as Completed</span>
                </button>
              </>
            )}
            {recommendation.status === 'viewed' && (
              <button 
                className="btn btn-sm btn-success"
                onClick={() => handleAction('complete')}
              >
                <i className="fas fa-check"></i>
                <span>Mark as Completed</span>
              </button>
            )}
            {recommendation.status === 'completed' && (
              <span className="completed-badge">
                <i className="fas fa-check-circle"></i>
                <span>Completed</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;