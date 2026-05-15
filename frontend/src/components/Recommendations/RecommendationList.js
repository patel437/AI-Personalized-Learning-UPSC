/**
 * RecommendationList Component
 * Displays list of recommendations with actions
 */

import React, { useState } from 'react';
import RecommendationCard from './RecommendationCard';

const RecommendationList = ({ recommendations, onAction }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (recommendations.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-check-circle"></i>
        <p>No recommendations at the moment</p>
        <p className="small-text">Generate new recommendations to see personalized suggestions</p>
      </div>
    );
  }

  return (
    <div className="recommendation-list">
      {recommendations.map((recommendation, index) => (
        <RecommendationCard
          key={recommendation.id || index}
          recommendation={recommendation}
          isExpanded={expandedId === recommendation.id}
          onToggle={() => setExpandedId(expandedId === recommendation.id ? null : recommendation.id)}
          onAction={onAction}
        />
      ))}
    </div>
  );
};

export default RecommendationList;