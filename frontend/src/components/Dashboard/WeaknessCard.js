/**
 * WeaknessCard Component
 * Displays weak areas and updates using cross-compatible backend dictionary keys
 */

import React from 'react';
import { Link } from 'react-router-dom';

const WeaknessCard = ({ scores }) => {
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

  // FIXED: Checks for both appended front-end labels and raw database dict keywords
  const getSubjectScore = (subject) => {
    if (scores?.[subject.key] !== undefined) {
      return scores[subject.key];
    }
    const simplifiedKey = subject.key.replace('_score', '');
    if (scores?.[simplifiedKey] !== undefined) {
      return scores[simplifiedKey];
    }
    return 0; // Fallback to 0 if no mock test scores have been posted yet
  };

  const weakSubjects = subjects
    .map(subject => ({
      ...subject,
      score: getSubjectScore(subject)
    }))
    .filter(subject => subject.score > 0 && subject.score < 60) // Only shows true weak categories
    .sort((a, b) => a.score - b.score);

  const strongSubjects = subjects
    .map(subject => ({
      ...subject,
      score: getSubjectScore(subject)
    }))
    .filter(subject => subject.score >= 75)
    .sort((a, b) => b.score - a.score);

  const getSeverityClass = (score) => {
    if (score < 40) return 'high';
    if (score < 55) return 'medium';
    return 'low';
  };

  const getImprovementMessage = (score, subjectName) => {
    if (score < 40) return `Start with NCERT basics for ${subjectName}. Focus on fundamental concepts.`;
    if (score < 55) return `Review standard reference textbooks for ${subjectName}. Practice sectional tests.`;
    return `Good progress in ${subjectName}! Focus on advanced topics and core micro-syllabus PYQs.`;
  };

  // Determine if the scores dictionary is completely empty or newly generated
  const hasNoDataAtAll = subjects.every(s => getSubjectScore(s) === 0);

  if (hasNoDataAtAll) {
    return (
      <div className="empty-state" style={{ padding: '25px', textAlign: 'center' }}>
        <i className="fas fa-chart-line" style={{ fontSize: '26px', color: '#bbb' }}></i>
        <p style={{ marginTop: '10px', color: '#666' }}>Complete a mock test to see your analytics dashboard performance evaluation.</p>
        <Link to="/mock-tests" className="btn btn-primary btn-sm mt-3">Take Mock Test</Link>
      </div>
    );
  }

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
        <div className="no-weaknesses" style={{ padding: '15px 0' }}>
          <i className="fas fa-check-circle" style={{ color: '#27ae60' }}></i>
          <p style={{ display: 'inline-block', marginLeft: '8px', fontWeight: '600', color: '#27ae60' }}>
            Excellent status! No major weaknesses identified.
          </p>
        </div>
      )}

      {strongSubjects.length > 0 && (
        <>
          <h4 className="mt-4">💪 Strong Areas</h4>
          <div className="strength-list" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            {strongSubjects.slice(0, 3).map(subject => (
              <div key={subject.key} className="strength-item" style={{ background: '#27ae6015', padding: '8px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className={subject.icon} style={{ color: '#27ae60' }}></i>
                <span style={{ fontWeight: '500', color: '#333' }}>{subject.name}</span>
                <span className="strength-score" style={{ fontWeight: '700', color: '#27ae60' }}>{Math.round(subject.score)}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WeaknessCard;