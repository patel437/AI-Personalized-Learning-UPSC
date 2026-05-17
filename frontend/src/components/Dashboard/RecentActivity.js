/**
 * RecentActivity Component
 * Shows live recent study logs, mock tests, and achievements from database records
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { studyLogsAPI, mockTestsAPI } from '../../assets/js/api';
import Loader from '../Common/Loader';

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIXED: Fetch real live database logs and mock entries in parallel safely
  const fetchRecentActivities = useCallback(async () => {
    try {
      const [studyRes, mockRes] = await Promise.all([
        studyLogsAPI.getIndividualLogs().catch(() => ({ data: { study_logs: [] } })),
        mockTestsAPI.getMockTests(5).catch(() => ({ data: { mock_tests: [] } }))
      ]);

      const activitiesList = [];

      // 1. Process Live Mock Tests data fields
      const mockTests = mockRes?.data?.mock_tests || [];
      mockTests.forEach(test => {
        activitiesList.push({
          id: `mock_${test.id}`,
          type: 'mock_test',
          title: `Mock Test: ${test.test_name}`,
          description: `Score: ${test.gs_score} (GS) + ${test.csat_score} (CSAT) = ${test.total_score}`,
          date: test.test_date || test.created_at,
          icon: 'fas fa-file-alt',
          color: '#9b59b6',
          link: '/mock-tests'
        });
      });

      // 2. FIXED: Map real logged study entries instead of the old hardcoded mock array
      const realStudyLogs = studyRes?.data?.study_logs || [];
      realStudyLogs.forEach((log) => {
        activitiesList.push({
          id: `study_${log.id}`,
          type: 'study',
          title: 'Study Session',
          description: `Studied ${log.study_hours} hours on: ${log.subjects_studied?.join(', ') || 'General Subjects'}`,
          date: log.log_date,
          icon: 'fas fa-book-open',
          color: '#27ae60',
          link: '/study-logs'
        });
      });

      // Sort combined activities by date string values (newest first)
      activitiesList.sort((a, b) => new Date(b.date) - new Date(a.date));
      setActivities(activitiesList.slice(0, 5));
      
    } catch (error) {
      console.error('Error compiling recent dashboard activities:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentActivities();
  }, [fetchRecentActivities]);

  // FIXED: Solves time-shifting by parsing pure calendar strings into local timezone midnights
  const getTimeAgo = (dateValue) => {
    const now = new Date();
    let activityDate;
    
    if (typeof dateValue === 'string' && dateValue.includes('-') && !dateValue.includes('T')) {
      const [year, month, day] = dateValue.split('-').map(Number);
      activityDate = new Date(year, month - 1, day); 
    } else {
      activityDate = new Date(dateValue);
    }

    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24 && now.getDate() === activityDate.getDate()) return `${diffHours} hours ago`;
    if (diffDays === 1 || (diffDays === 0 && now.getDate() !== activityDate.getDate())) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return <Loader size="small" />;
  }

  if (activities.length === 0) {
    return (
      <div className="empty-state" style={{ padding: '20px', textAlign: 'center' }}>
        <i className="fas fa-history" style={{ fontSize: '24px', color: '#ccc' }}></i>
        <p style={{ marginTop: '10px', color: '#666' }}>No recent activity found.</p>
        <Link to="/study-logs" className="btn btn-primary btn-sm mt-2">Log Study Hours</Link>
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
    </div>
  );
};

export default RecentActivity;