/**
 * WeaknessCard Component
 * Displays weak areas and suggestions for improvement
 */

import React from 'react';
import { Link } from 'react-router-dom';

const WeaknessCard = ({ scores }) => {
  // Define subjects and their display names
  const subjects = [
    { key: 'history_score', name: 'History & Culture', icon: 'fas fa-landmark' },
    { key: 'geography_score', name: 'Geography', icon: 'fas fa-globe' },
    { key: 'polity_score', name: 'Polity', icon: 'fas fa-gavel' },
    { key: 'economy_score', name: 'Economy', icon: 'fas fa-chart-line' },
    { key: 'science_tech_score', name: 'Science & Tech', icon: 'fas fa-microchip' },
    { key: 'environment_score', name: 'Environment', icon: 'fas fa-leaf' },
    { key: 'current_affairs_score', name: 'Current Affairs', icon: 'fas fa-newspaper' },
    { key: 'art_culture_score', name: 'Art & Culture', icon: 'fas fa-palette' }
  ];

  // Get weak subjects (score < 60)
  const weakSubjects = subjects
    .map(subject => ({
      ...subject,
      score: scores?.[subject.key] || 0
    }))
    .filter(subject => subject.score < 60)
    .sort((a, b) => a.score - b.score);

  // Get strong subjects (score >= 75)
  const strongSubjects = subjects
    .map(subject => ({
      ...subject,
      score: scores?.[subject.key] || 0
    }))
    .filter(subject => subject.score >= 75)
    .sort((a, b) => b.score - a.score);

  // Get severity class based on score
  const getSeverityClass = (score) => {
    if (score < 40) return 'high';
    if (score < 55) return 'medium';
    return 'low';
  };

  // Get improvement message based on score
  const getImprovementMessage = (score, subjectName) => {
    if (score < 40) {
      return `Start with NCERT basics for ${subjectName}. Focus on fundamental concepts.`;
    }
    if (score < 55) {
      return `Review standard books for ${subjectName}. Practice topic-wise questions.`;
    }
    return `Good progress in ${subjectName}! Focus on advanced topics and PYQs.`;
  };

  return (
    <div className="weakness-analysis">
      {weakSubjects.length > 0 ? (
        <>
          <h4>⚠️ Areas Needing Attention</h4>
          <div className="weakness-list">
            {weakSubjects.map(subject => (
              <div key={subject.key} className={`weakness-item ${getSeverityClass(subject.score)}`}>
                <div className="weakness-header">
                  <div className="weakness-info">
                    <i className={subject.icon}></i>
                    <span className="weakness-name">{subject.name}</span>
                  </div>
                  <div className="weakness-score">{Math.round(subject.score)}%</div>
                </div>
                <div className="progress-bar">
                  <div 
                    className={`progress-fill ${getSeverityClass(subject.score)}`}
                    style={{ width: `${subject.score}%` }}
                  ></div>
                </div>
                <p className="weakness-message">{getImprovementMessage(subject.score, subject.name)}</p>
                <Link to={`/recommendations?subject=${subject.key.replace('_score', '')}`} className="btn-improve">
                  View Recommendations <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-weaknesses">
          <i className="fas fa-check-circle"></i>
          <p>Excellent! No major weaknesses identified.</p>
          <p className="small-text">Keep maintaining your performance across all subjects.</p>
        </div>
      )}

      {strongSubjects.length > 0 && (
        <>
          <h4 className="mt-4">💪 Your Strengths</h4>
          <div className="strength-list">
            {strongSubjects.slice(0, 3).map(subject => (
              <div key={subject.key} className="strength-item">
                <i className={subject.icon}></i>
                <span>{subject.name}</span>
                <span className="strength-score">{Math.round(subject.score)}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {weakSubjects.length === 0 && strongSubjects.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-chart-line"></i>
          <p>Complete a mock test to see your performance analysis</p>
          <Link to="/mock-tests" className="btn btn-primary btn-sm">
            Take Mock Test
          </Link>
        </div>
      )}
    </div>
  );
};

export default WeaknessCard;