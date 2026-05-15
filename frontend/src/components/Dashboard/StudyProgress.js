/**
 * StudyProgress Component
 * Shows study hours and consistency tracking
 */

import React, { useState, useEffect } from 'react';
import { studyLogsAPI } from '../../assets/js/api';
import Loader from '../Common/Loader';

const StudyProgress = () => {
  const [weeklyData, setWeeklyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      const response = await studyLogsAPI.getWeeklySummary();
      setWeeklyData(response?.data);
    } catch (error) {
      console.error('Error fetching study data:', error);
      // Set mock data for demo
      setWeeklyData({
        total_hours: 32.5,
        average_daily_hours: 4.6,
        days_studied: 5,
        streak: 4,
        daily_breakdown: [4.5, 5.2, 3.8, 6.1, 4.2, 0, 8.5]
      });
    } finally {
      setLoading(false);
    }
  };

  // Get day labels
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Get daily hours (mock if not available)
  const dailyHours = weeklyData?.daily_breakdown || [0, 0, 0, 0, 0, 0, 0];

  // Calculate target percentage
  const targetHours = 6;
  const todayHours = dailyHours[new Date().getDay() - 1] || 0;
  const targetProgress = Math.min(100, (todayHours / targetHours) * 100);

  // Get consistency rating
  const getConsistencyRating = () => {
    const studiedDays = dailyHours.filter(h => h > 0).length;
    if (studiedDays >= 6) return { text: 'Excellent', color: '#27ae60' };
    if (studiedDays >= 4) return { text: 'Good', color: '#4a90e2' };
    if (studiedDays >= 2) return { text: 'Average', color: '#f39c12' };
    return { text: 'Needs Improvement', color: '#e74c3c' };
  };

  const consistency = getConsistencyRating();

  if (loading) {
    return <Loader size="small" text="Loading study data..." />;
  }

  return (
    <div className="study-progress">
      {/* Today's Progress */}
      <div className="today-progress">
        <div className="progress-header">
          <h4>Today's Goal</h4>
          <span className="target-hours">Target: {targetHours} hours</span>
        </div>
        <div className="progress-circle-container">
          <div className="progress-circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" strokeWidth="8"/>
              <circle 
                cx="50" cy="50" r="45" fill="none" 
                stroke="#4a90e2" strokeWidth="8"
                strokeDasharray={`${(targetProgress * 283) / 100} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="progress-text">
              <span className="current-hours">{todayHours}</span>
              <span className="total-hours">/{targetHours}h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="weekly-stats">
        <div className="stat-row">
          <div className="stat-item">
            <div className="stat-value">{weeklyData?.total_hours || 0}</div>
            <div className="stat-label">Total Hours</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{weeklyData?.average_daily_hours?.toFixed(1) || 0}</div>
            <div className="stat-label">Daily Avg</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{weeklyData?.days_studied || 0}</div>
            <div className="stat-label">Days Studied</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{weeklyData?.streak || 0}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="weekly-chart">
        <h4>This Week's Study</h4>
        <div className="bar-chart">
          {dayLabels.map((day, index) => (
            <div key={day} className="bar-item">
              <div className="bar-label">{day}</div>
              <div className="bar-container">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${Math.min(100, (dailyHours[index] / targetHours) * 100)}%`,
                    backgroundColor: dailyHours[index] >= targetHours ? '#27ae60' : '#4a90e2'
                  }}
                ></div>
              </div>
              <div className="bar-value">{dailyHours[index].toFixed(1)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Consistency Rating */}
      <div className="consistency-rating">
        <div className="rating-header">
          <i className="fas fa-chart-line"></i>
          <span>Consistency Rating</span>
        </div>
        <div className="rating-value" style={{ color: consistency.color }}>
          {consistency.text}
        </div>
        <p className="rating-message">
          {consistency.text === 'Excellent' && "Great job! You're building a strong study habit!"}
          {consistency.text === 'Good' && "Good progress! Aim for daily consistency."}
          {consistency.text === 'Average' && "Try to study at least 4-5 days per week."}
          {consistency.text === 'Needs Improvement' && "Set a daily reminder to build consistency."}
        </p>
      </div>

      {/* Quick Log Button */}
      <div className="quick-log">
        <button className="btn btn-primary btn-block" onClick={() => window.location.href = '/study-logs'}>
          <i className="fas fa-plus"></i>
          <span>Log Today's Study Hours</span>
        </button>
      </div>
    </div>
  );
};

export default StudyProgress;