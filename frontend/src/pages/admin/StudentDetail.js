/**
 * Student Detail Page
 * View detailed information about a specific student
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { adminAPI, scoresAPI, mockTestsAPI, recommendationsAPI } from '../../assets/js/api';
import Loader, { CardSkeleton } from '../../components/Common/Loader';
import LineChart from '../../components/Charts/LineChart';
import BarChart from '../../components/Charts/BarChart';
import RadarChart from '../../components/Charts/RadarChart';
import Modal from '../../components/Common/Modal';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showConfirm } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [scores, setScores] = useState(null);
  const [mockTests, setMockTests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    setLoading(true);
    try {
      // Fetch all student data in parallel
      const [studentRes, scoresRes, mockRes, recRes] = await Promise.all([
        adminAPI.getStudentById(id),
        scoresAPI.getScoreHistory(20),
        mockTestsAPI.getMockTests(20),
        recommendationsAPI.getRecommendations()
      ]);
      
      setStudent(studentRes?.data);
      setScores(scoresRes?.data);
      setMockTests(mockRes?.data?.mock_tests || []);
      setRecommendations(recRes?.data?.recommendations || []);
      
    } catch (error) {
      console.error('Error fetching student details:', error);
      showError('Failed to load student details');
      
      // Set mock data for demo
      setStudent(mockStudent);
      setScores(mockScores);
      setMockTests(mockMockTests);
      setRecommendations(mockRecommendations);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async () => {
    // API call to delete student
    showSuccess('Student has been deleted');
    navigate('/admin/students');
  };

  const handleSendEmail = () => {
    showSuccess('Email sent to student');
  };

  const mockStudent = {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    phone: '9876543210',
    age: 26,
    gender: 'Male',
    graduation_stream: 'Engineering',
    graduation_percentage: 72,
    preparation_months: 12,
    daily_study_hours: 6,
    attempt_number: 2,
    previous_prelims_qualified: false,
    coaching: 'Vision IAS',
    overall_score: 62,
    qualification_probability: 45,
    status: 'active',
    registered_at: '2024-01-15',
    last_active: '2024-03-15'
  };

  const mockScores = {
    history: 65, geography: 55, polity: 70, economy: 42,
    science_tech: 48, environment: 60, current_affairs: 68, art_culture: 58,
    comprehension: 72, logical_reasoning: 68, quantitative: 45,
    data_interpretation: 58, decision_making: 62
  };

  const mockMockTests = [
    { test_name: 'Test 1', gs_score: 85, csat_score: 62, test_date: '2024-01-20' },
    { test_name: 'Test 2', gs_score: 92, csat_score: 65, test_date: '2024-01-27' },
    { test_name: 'Test 3', gs_score: 88, csat_score: 68, test_date: '2024-02-03' }
  ];

  const mockRecommendations = [
    { id: 1, priority: 'high', subject: 'Economy', content: 'Focus on basic concepts', status: 'pending' },
    { id: 2, priority: 'high', subject: 'Science & Tech', content: 'Review NCERTs', status: 'pending' },
    { id: 3, priority: 'medium', subject: 'Geography', content: 'Practice map-based questions', status: 'viewed' }
  ];

  const performanceData = {
    labels: ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5'],
    scores: [62, 58, 65, 68, 72]
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Student Details | UPSC Learning System</title>
        </Helmet>
        <div className="student-detail-container">
          <CardSkeleton />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{student?.name} | Student Details</title>
      </Helmet>

      <div className="student-detail-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <button className="btn-back" onClick={() => navigate('/admin/students')}>
              <i className="fas fa-arrow-left"></i>
              <span>Back to Students</span>
            </button>
            <h1 className="page-title">{student?.name}</h1>
            <p className="page-subtitle">Student ID: {student?.id}</p>
          </div>
          <div className="header-right">
            <button className="btn btn-outline" onClick={handleSendEmail}>
              <i className="fas fa-envelope"></i>
              <span>Send Message</span>
            </button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              <i className="fas fa-trash"></i>
              <span>Delete Student</span>
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="profile-card-main">
          <div className="profile-avatar">
            <div className="avatar-large">{student?.name?.charAt(0)}</div>
          </div>
          <div className="profile-info">
            <div className="info-row">
              <div className="info-item">
                <label>Email</label>
                <span>{student?.email}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{student?.phone || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>Age / Gender</label>
                <span>{student?.age} / {student?.gender}</span>
              </div>
            </div>
            <div className="info-row">
              <div className="info-item">
                <label>Graduation</label>
                <span>{student?.graduation_stream} - {student?.graduation_percentage}%</span>
              </div>
              <div className="info-item">
                <label>Coaching</label>
                <span>{student?.coaching || 'Self Study'}</span>
              </div>
              <div className="info-item">
                <label>Attempt Number</label>
                <span>{student?.attempt_number}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <i className="fas fa-chart-line"></i> Overview
          </button>
          <button className={`tab-btn ${activeTab === 'scores' ? 'active' : ''}`} onClick={() => setActiveTab('scores')}>
            <i className="fas fa-chart-bar"></i> Scores
          </button>
          <button className={`tab-btn ${activeTab === 'mocktests' ? 'active' : ''}`} onClick={() => setActiveTab('mocktests')}>
            <i className="fas fa-file-alt"></i> Mock Tests
          </button>
          <button className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>
            <i className="fas fa-lightbulb"></i> Recommendations
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="tab-content">
            <div className="row two-column-layout">
              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Performance Trend</h3>
                </div>
                <div className="chart-body">
                  <LineChart
                    data={[{
                      label: 'Score',
                      values: performanceData.scores,
                      borderColor: '#4a90e2'
                    }]}
                    labels={performanceData.labels}
                    yLabel="Score (%)"
                    height={300}
                  />
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h3 className="chart-title">Subject-wise Performance</h3>
                </div>
                <div className="chart-body">
                  <RadarChart
                    data={[{
                      label: 'Current Score',
                      values: Object.values(mockScores).slice(0, 8),
                      borderColor: '#4a90e2'
                    }]}
                    labels={Object.keys(mockScores).slice(0, 8)}
                    height={300}
                  />
                </div>
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-card-small">
                <div className="stat-value">{student?.overall_score}%</div>
                <div className="stat-label">Overall Score</div>
              </div>
              <div className="stat-card-small">
                <div className="stat-value">{student?.qualification_probability}%</div>
                <div className="stat-label">Qualification Probability</div>
              </div>
              <div className="stat-card-small">
                <div className="stat-value">{student?.preparation_months} months</div>
                <div className="stat-label">Preparation Duration</div>
              </div>
              <div className="stat-card-small">
                <div className="stat-value">{student?.daily_study_hours} hrs/day</div>
                <div className="stat-label">Daily Study</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="tab-content">
            <div className="chart-card">
              <div className="chart-header">
                <h3 className="chart-title">All Subject Scores</h3>
              </div>
              <div className="chart-body">
                <BarChart
                  data={[{
                    label: 'Score (%)',
                    values: Object.values(mockScores),
                    backgroundColor: '#4a90e2'
                  }]}
                  labels={Object.keys(mockScores).map(k => k.replace('_', ' ').toUpperCase())}
                  height={400}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mocktests' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Mock Test History</h3>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th>Date</th>
                        <th>GS Score</th>
                        <th>CSAT Score</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTests.map((test, idx) => (
                        <tr key={idx}>
                          <td>{test.test_name}</td>
                          <td>{new Date(test.test_date).toLocaleDateString()}</td>
                          <td>{test.gs_score}/200</td>
                          <td>{test.csat_score}/200</td>
                          <td>{test.gs_score + test.csat_score}/400</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="tab-content">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Generated Recommendations</h3>
              </div>
              <div className="card-body">
                {recommendations.map((rec) => (
                  <div key={rec.id} className={`rec-item priority-${rec.priority}`}>
                    <div className="rec-icon">
                      <i className="fas fa-lightbulb"></i>
                    </div>
                    <div className="rec-content">
                      <h4>{rec.subject} - {rec.priority.toUpperCase()} Priority</h4>
                      <p>{rec.content}</p>
                      <div className="rec-meta">
                        <span className={`status-badge ${rec.status}`}>{rec.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Student"
        size="small"
      >
        <div className="delete-confirm">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Are you sure you want to delete <strong>{student?.name}</strong>?</p>
          <p className="text-danger">This action cannot be undone. All student data will be permanently removed.</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDeleteStudent}>Delete Student</button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default StudentDetail;