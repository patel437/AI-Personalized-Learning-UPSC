/**
 * Study Logs Page
 * Track daily study hours and view study history
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { studyLogsAPI } from '../../assets/js/api';
import { formatDate } from '../../assets/js/utils';
import Loader, { CardSkeleton } from '../../components/Common/Loader';
import Modal from '../../components/Common/Modal';
import StudyLogForm from '../../components/Forms/StudyLogForm';

const StudyLogs = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [studyLogs, setStudyLogs] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchStudyData();
  }, []);

  const fetchStudyData = async () => {
    setLoading(true);
    try {
      const summaryRes = await studyLogsAPI.getWeeklySummary();
      setWeeklySummary(summaryRes?.data);
      
      // Fetch recent study logs
      // For demo, using mock data
      setStudyLogs(mockStudyLogs);
      
    } catch (error) {
      console.error('Error fetching study data:', error);
      showError('Failed to load study data');
      
      // Set mock data
      setWeeklySummary({
        total_hours: 32.5,
        average_daily_hours: 4.6,
        days_studied: 5,
        streak: 4,
        consistency_score: 72
      });
      setStudyLogs(mockStudyLogs);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = async (logData) => {
    try {
      const response = await studyLogsAPI.addStudyLog(logData);
      if (response?.data?.study_log) {
        showSuccess('Study log added successfully!');
        setShowAddModal(false);
        fetchStudyData();
      }
    } catch (error) {
      showError(error?.message || 'Failed to add study log');
    }
  };

  const getWeekDays = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      return { day, date, hours: 0 };
    });
  };

  const mockStudyLogs = [
    { id: 1, log_date: '2024-03-04', study_hours: 5.5, subjects_studied: ['History', 'Polity'], quizzes_taken: 2, quiz_scores: [75, 82] },
    { id: 2, log_date: '2024-03-05', study_hours: 6, subjects_studied: ['Geography', 'Economy'], quizzes_taken: 3, quiz_scores: [68, 72, 85] },
    { id: 3, log_date: '2024-03-06', study_hours: 4.5, subjects_studied: ['Science & Tech', 'Environment'], quizzes_taken: 1, quiz_scores: [70] },
    { id: 4, log_date: '2024-03-07', study_hours: 7, subjects_studied: ['Polity', 'Current Affairs'], quizzes_taken: 4, quiz_scores: [88, 76, 82, 79] },
    { id: 5, log_date: '2024-03-08', study_hours: 3.5, subjects_studied: ['History'], quizzes_taken: 1, quiz_scores: [65] }
  ];

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Study Logs | UPSC Learning System</title>
        </Helmet>
        <div className="studylogs-container">
          <div className="page-header">
            <CardSkeleton />
          </div>
          <div className="stats-grid">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
          <CardSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Study Logs | UPSC Learning System</title>
        <meta name="description" content="Track your daily study hours and progress" />
      </Helmet>

      <div className="studylogs-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-book-open"></i>
              <span>Study Logs</span>
            </h1>
            <p className="page-subtitle">
              Track your daily study hours and maintain consistency
            </p>
          </div>
          <div className="header-right">
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus"></i>
              <span>Log Study Hours</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-clock"></i></div>
            <div className="stat-value">{weeklySummary?.total_hours || 0}</div>
            <div className="stat-label">Total Hours (This Week)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
            <div className="stat-value">{weeklySummary?.average_daily_hours?.toFixed(1) || 0}</div>
            <div className="stat-label">Avg Daily Hours</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-calendar-check"></i></div>
            <div className="stat-value">{weeklySummary?.days_studied || 0}</div>
            <div className="stat-label">Days Studied (This Week)</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-fire"></i></div>
            <div className="stat-value">{weeklySummary?.streak || 0}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        {/* Weekly Calendar View */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-calendar-week"></i>
              <span>This Week's Study</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="weekly-calendar">
              {getWeekDays().map((day, index) => {
                const log = studyLogs.find(l => formatDate(l.log_date) === formatDate(day.date));
                const hours = log?.study_hours || 0;
                const targetHours = 6;
                const percentage = Math.min(100, (hours / targetHours) * 100);
                
                return (
                  <div key={index} className="calendar-day">
                    <div className="day-name">{day.day}</div>
                    <div className="day-date">{formatDate(day.date, 'DD/MM')}</div>
                    <div className="day-hours-circle" style={{ 
                      borderColor: hours >= targetHours ? '#27ae60' : hours > 0 ? '#4a90e2' : '#e0e0e0',
                      background: hours > 0 ? `${hours >= targetHours ? '#27ae60' : '#4a90e2'}20` : '#f5f5f5'
                    }}>
                      <span className="hours-value">{hours}</span>
                      <span className="hours-label">hrs</span>
                    </div>
                    {hours > 0 && (
                      <div className="day-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    )}
                    {hours === 0 && (
                      <button className="btn-add-log" onClick={() => setSelectedDate(day.date)}>
                        <i className="fas fa-plus"></i>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Study Logs Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-history"></i>
              <span>Recent Study Logs</span>
            </h3>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Study Hours</th>
                    <th>Subjects Studied</th>
                    <th>Quizzes</th>
                    <th>Avg Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {studyLogs.map((log) => {
                    const avgScore = log.quiz_scores?.length ? 
                      Math.round(log.quiz_scores.reduce((a, b) => a + b, 0) / log.quiz_scores.length) : 0;
                    
                    return (
                      <tr key={log.id}>
                        <td>{formatDate(log.log_date)}</td>
                        <td className="study-hours">{log.study_hours} hrs</td>
                        <td>
                          <div className="subjects-badges">
                            {log.subjects_studied?.slice(0, 3).map((subject, idx) => (
                              <span key={idx} className="subject-badge">{subject}</span>
                            ))}
                            {log.subjects_studied?.length > 3 && (
                              <span className="subject-badge more">+{log.subjects_studied.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td>{log.quizzes_taken || 0}</td>
                        <td>
                          {avgScore > 0 ? (
                            <span className={`score-badge ${avgScore >= 75 ? 'high' : avgScore >= 60 ? 'medium' : 'low'}`}>
                              {avgScore}%
                            </span>
                          ) : '-'}
                        </td>
                        <td>
                          <button className="btn-icon">
                            <i className="fas fa-edit"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Study Tips */}
        <div className="tips-card">
          <i className="fas fa-lightbulb"></i>
          <div className="tips-content">
            <h4>Study Tips for Better Consistency</h4>
            <ul>
              <li>🕐 Study at the same time every day to build a habit</li>
              <li>📝 Take short notes while studying for better retention</li>
              <li>🎯 Set daily goals and track your progress</li>
              <li>🧘 Take a 5-minute break every hour to stay focused</li>
              <li>📊 Review what you studied at the end of each day</li>
            </ul>
          </div>
        </div>

        {/* Add Study Log Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Log Study Hours"
          size="medium"
        >
          <StudyLogForm onSubmit={handleAddLog} onCancel={() => setShowAddModal(false)} />
        </Modal>
      </div>
    </>
  );
};

export default StudyLogs;