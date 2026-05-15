/**
 * QuickStats Component
 * Displays key metrics in stat cards
 */

import React from 'react';

const QuickStats = ({ data, scores }) => {
  // Calculate stats from data
  const overallScore = scores?.overall_score || data?.overall_score || 0;
  const gsScore = scores?.gs_average_score || data?.gs_average_score || 0;
  const csatScore = scores?.csat_average_score || data?.csat_average_score || 0;
  const studyHours = data?.daily_study_hours || 6;
  const mockTests = data?.mock_tests_count || 0;
  const qualificationProb = data?.qualification_probability || 0;

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 75) return '#27ae60';
    if (score >= 60) return '#4a90e2';
    if (score >= 45) return '#f39c12';
    return '#e74c3c';
  };

  const stats = [
    {
      id: 1,
      icon: 'fas fa-chart-line',
      label: 'Overall Score',
      value: `${Math.round(overallScore)}%`,
      color: getScoreColor(overallScore),
      trend: '+5%',
      trendUp: true
    },
    {
      id: 2,
      icon: 'fas fa-book-open',
      label: 'GS Average',
      value: `${Math.round(gsScore)}%`,
      color: getScoreColor(gsScore),
      trend: null
    },
    {
      id: 3,
      icon: 'fas fa-calculator',
      label: 'CSAT Average',
      value: `${Math.round(csatScore)}%`,
      color: getScoreColor(csatScore),
      trend: null
    },
    {
      id: 4,
      icon: 'fas fa-clock',
      label: 'Daily Study',
      value: `${studyHours} hrs`,
      color: '#4a90e2',
      trend: 'Target: 6 hrs'
    },
    {
      id: 5,
      icon: 'fas fa-file-alt',
      label: 'Mock Tests',
      value: mockTests,
      color: '#9b59b6',
      trend: 'Target: 50+'
    },
    {
      id: 6,
      icon: 'fas fa-chart-pie',
      label: 'Qualification Probability',
      value: `${Math.round(qualificationProb)}%`,
      color: qualificationProb >= 60 ? '#27ae60' : qualificationProb >= 40 ? '#f39c12' : '#e74c3c',
      trend: qualificationProb >= 70 ? 'High Chance' : qualificationProb >= 40 ? 'Medium Chance' : 'Needs Improvement'
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map(stat => (
        <div key={stat.id} className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
            <i className={stat.icon}></i>
          </div>
          <div className="stat-value" style={{ color: stat.color }}>
            {stat.value}
          </div>
          <div className="stat-label">{stat.label}</div>
          {stat.trend && (
            <div className={`stat-trend ${stat.trendUp ? 'up' : 'down'}`}>
              {stat.trendUp ? <i className="fas fa-arrow-up"></i> : <i className="fas fa-arrow-down"></i>}
              <span>{stat.trend}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuickStats;