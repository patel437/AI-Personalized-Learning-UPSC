/**
 * RecentActivity Component
 * Shows recent study logs, mock tests, and achievements
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../assets/js/utils';
import { studyLogsAPI, mockTestsAPI } from '../../assets/js/api';
import Loader from '../Common/Loader';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      // Fetch study logs and mock tests in parallel
      const [studyRes, mockRes] = await Promise.all([
        studyLogsAPI.getWeeklySummary(),
        mockTestsAPI.getMockTests(5)
      ]);

      const activitiesList = [];

      // Add mock tests to activities
      const mockTests = mockRes?.data?.mock_tests || [];
      mockTests.forEach(test => {
        activitiesList.push({
          id: `mock_${test.id}`,
          type: 'mock_test',
          title: `Mock Test: ${test.test_name}`,
          description: `Score: ${test.gs_score} (GS) + ${test.csat_score} (CSAT) = ${test.total_score}`,
          date: test.test_date,
          icon: 'fas fa-file-alt',
          color: '#9b59b6',
          link: `/mock-tests/${test.id}`
        });
      });

      // Add study logs to activities (simulated)
      const studyLogs = [
        { date: new Date(), hours: 5.5, subjects: ['History', 'Polity'] },
        { date: new Date(Date.now() - 86400000), hours: 6, subjects: ['Geography', 'Economy'] },
        { date: new Date(Date.now() - 172800000), hours: 4.5, subjects: ['Science & Tech'] }
      ];

      studyLogs.forEach((log, index) => {
        activitiesList.push({
          id: `study_${index}`,
          type: 'study',
          title: 'Study Session',
          description: `Studied ${log.hours} hours: ${log.subjects.join(', ')}`,
          date: log.date,
          icon: 'fas fa-book-open',
          color: '#27ae60',
          link: '/study-logs'
        });
      });

      // Sort by date (newest first)
      activitiesList.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setActivities(activitiesList.slice(0, 5));
    } catch (error) {
      console.error('Error fetching activities:', error);
      // Set mock data
      setActivities([
        {
          id: 1,
          type: 'mock_test',
          title: 'Mock Test: UPSC Prelims 2024 - Test 5',
          description: 'Score: 112/200 (GS) + 85/200 (CSAT)',
          date: new Date(),
          icon: 'fas fa-file-alt',
          color: '#9b59b6'
        },
        {
          id: 2,
          type: 'study',
          title: 'Study Session',
          description: 'Studied 5.5 hours: History, Polity',
          date: new Date(Date.now() - 86400000),
          icon: 'fas fa-book-open',
          color: '#27ae60'
        },
        {
          id: 3,
          type: 'achievement',
          title: 'Achievement Unlocked',
          description: 'Completed 30-day study streak!',
          date: new Date(Date.now() - 172800000),
          icon: 'fas fa-trophy',
          color: '#f39c12'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Get time ago string
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return <Loader size="small" />;
  }

  if (activities.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-history"></i>
        <p>No recent activity</p>
        <Link to="/study-logs" className="btn btn-primary btn-sm">
          Log Your First Study Session
        </Link>
      </div>
    );
  }

  return (
    <div className="recent-activity">
      {activities.map(activity => (
        <div key={activity.id} className="activity-item">
          <div className="activity-icon" style={{ backgroundColor: `${activity.color}20`, color: activity.color }}>
            <i className={activity.icon}></i>
          </div>
          <div className="activity-content">
            <div className="activity-title">{activity.title}</div>
            <div className="activity-description">{activity.description}</div>
            <div className="activity-time">
              <i className="fas fa-clock"></i>
              <span>{getTimeAgo(activity.date)}</span>
            </div>
          </div>
          {activity.link && (
            <Link to={activity.link} className="activity-link">
              <i className="fas fa-chevron-right"></i>
            </Link>
          )}
        </div>
      ))}
      
      <div className="view-all">
        <Link to="/study-logs" className="btn-link">
          View All Activity <i className="fas fa-arrow-right"></i>
        </Link>
      </div>
    </div>
  );
};

export default RecentActivity;