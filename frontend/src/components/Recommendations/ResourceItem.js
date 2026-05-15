/**
 * ResourceItem Component
 * Displays individual resource with download/view option
 */

import React, { useState } from 'react';

const ResourceItem = ({ resource }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getResourceIcon = (type) => {
    const icons = {
      book: 'fas fa-book',
      video: 'fas fa-video',
      notes: 'fas fa-file-alt',
      practice: 'fas fa-tasks',
      quiz: 'fas fa-question-circle',
      article: 'fas fa-newspaper',
      course: 'fas fa-graduation-cap',
      default: 'fas fa-link'
    };
    return icons[type] || icons.default;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return '#27ae60';
      case 'medium':
        return '#f39c12';
      case 'hard':
        return '#e74c3c';
      default:
        return '#3498db';
    }
  };

  const handleAction = () => {
    if (resource.url) {
      window.open(resource.url, '_blank');
    } else if (resource.link) {
      window.open(resource.link, '_blank');
    } else {
      // Show preview modal or download option
      console.log('Resource clicked:', resource);
    }
  };

  return (
    <div 
      className={`resource-item ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleAction}
    >
      <div className="resource-icon" style={{ backgroundColor: `${getDifficultyColor(resource.difficulty)}20` }}>
        <i className={getResourceIcon(resource.type)} style={{ color: getDifficultyColor(resource.difficulty) }}></i>
      </div>
      <div className="resource-info">
        <h4 className="resource-title">{resource.title}</h4>
        <div className="resource-meta">
          {resource.author && (
            <span className="meta-item">
              <i className="fas fa-user"></i>
              <span>{resource.author}</span>
            </span>
          )}
          {resource.difficulty && (
            <span className="meta-item" style={{ color: getDifficultyColor(resource.difficulty) }}>
              <i className="fas fa-signal"></i>
              <span>{resource.difficulty}</span>
            </span>
          )}
          {resource.type && (
            <span className="meta-item">
              <i className={getResourceIcon(resource.type)}></i>
              <span>{resource.type}</span>
            </span>
          )}
          {resource.pages && (
            <span className="meta-item">
              <i className="fas fa-file"></i>
              <span>{resource.pages} pages</span>
            </span>
          )}
          {resource.duration && (
            <span className="meta-item">
              <i className="fas fa-clock"></i>
              <span>{resource.duration}</span>
            </span>
          )}
          {resource.questions && (
            <span className="meta-item">
              <i className="fas fa-question"></i>
              <span>{resource.questions} questions</span>
            </span>
          )}
        </div>
        {resource.description && (
          <p className="resource-description">{resource.description}</p>
        )}
      </div>
      <div className="resource-action">
        <button className="btn-icon">
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default ResourceItem;