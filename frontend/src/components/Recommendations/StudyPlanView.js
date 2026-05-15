/**
 * StudyPlanView Component
 * Displays weekly study plan with subjects and hours
 */

import React, { useState } from 'react';

const StudyPlanView = ({ studyPlan }) => {
  const [expandedDay, setExpandedDay] = useState(null);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getPriorityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getProgressWidth = (hours, targetHours = 6) => {
    const percentage = (hours / targetHours) * 100;
    return Math.min(100, percentage);
  };

  // If studyPlan is an array, use it; if it's an object with days, convert it
  const getPlanForDay = (day) => {
    if (Array.isArray(studyPlan)) {
      const plan = studyPlan.find(d => d.day === day);
      return plan || null;
    }
    return studyPlan?.[day] || null;
  };

  if (!studyPlan) {
    return (
      <div className="empty-state">
        <i className="fas fa-calendar-alt"></i>
        <p>No study plan available</p>
        <p className="small-text">Generate recommendations to create a personalized study plan</p>
      </div>
    );
  }

  return (
    <div className="study-plan-view">
      <div className="plan-header">
        <div className="header-info">
          <i className="fas fa-info-circle"></i>
          <span>Follow this weekly schedule to improve your weak areas</span>
        </div>
      </div>

      <div className="plan-days">
        {days.map((day, index) => {
          const plan = getPlanForDay(day);
          const isExpanded = expandedDay === day;
          const priorityClass = getPriorityClass(plan?.severity);
          
          return (
            <div key={day} className={`plan-day ${priorityClass}`}>
              <div 
                className="plan-day-header"
                onClick={() => setExpandedDay(isExpanded ? null : day)}
              >
                <div className="day-info">
                  <span className="day-name">{day}</span>
                  {plan && (
                    <>
                      <span className="day-focus">
                        <i className="fas fa-bullseye"></i>
                        <span>{plan.primary_focus}</span>
                      </span>
                      <span className="day-hours">
                        <i className="fas fa-clock"></i>
                        <span>{plan.recommended_hours} hours</span>
                      </span>
                    </>
                  )}
                </div>
                <button className="expand-btn">
                  <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                </button>
              </div>

              {/* Progress bar */}
              {plan && (
                <div className="plan-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getProgressWidth(plan.recommended_hours)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Expanded content */}
              {isExpanded && plan && (
                <div className="plan-day-details">
                  {/* Strategy */}
                  <div className="detail-section">
                    <h5>
                      <i className="fas fa-lightbulb"></i>
                      <span>Study Strategy</span>
                    </h5>
                    <p>{plan.strategy}</p>
                  </div>

                  {/* Resources */}
                  {plan.resources && plan.resources.length > 0 && (
                    <div className="detail-section">
                      <h5>
                        <i className="fas fa-book"></i>
                        <span>Recommended Resources</span>
                      </h5>
                      <ul className="resources-list">
                        {plan.resources.map((resource, idx) => (
                          <li key={idx}>
                            <i className={`fas ${resource.type === 'book' ? 'fa-book' : 
                                             resource.type === 'video' ? 'fa-video' : 
                                             resource.type === 'notes' ? 'fa-file-alt' : 'fa-link'}`}></i>
                            <span>{resource.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="detail-section tips">
                    <h5>
                      <i className="fas fa-star"></i>
                      <span>Quick Tips</span>
                    </h5>
                    <ul>
                      <li>Take a 5-minute break every hour</li>
                      <li>Review what you studied yesterday</li>
                      <li>Practice at least 20 MCQs related to the topic</li>
                      <li>Make short notes for quick revision</li>
                    </ul>
                  </div>
                </div>
              )}

              {!plan && isExpanded && (
                <div className="plan-day-details">
                  <div className="detail-section">
                    <p className="text-muted">Rest day or revision day. Use this time to catch up or practice mock tests.</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="plan-footer">
        <div className="footer-note">
          <i className="fas fa-heart" style={{ color: '#e74c3c' }}></i>
          <span>Stay consistent! Even 15 minutes of focused study is better than hours of distraction.</span>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanView;