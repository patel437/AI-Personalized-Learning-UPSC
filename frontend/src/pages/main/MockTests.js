/**
 * Mock Tests Page
 * View mock test history and add new test results
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { mockTestsAPI } from '../../assets/js/api';
import { formatDate } from '../../assets/js/utils';
import Loader, { CardSkeleton } from '../../components/Common/Loader';
import Modal from '../../components/Common/Modal';
import MockTestForm from '../../components/Forms/MockTestForm';

const MockTests = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [mockTests, setMockTests] = useState([]);
  const [trend, setTrend] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageGS: 0,
    averageCSAT: 0,
    bestGS: 0,
    bestCSAT: 0,
    improvement: 0
  });

  useEffect(() => {
    fetchMockTests();
  }, []);

  const fetchMockTests = async () => {
    setLoading(true);
    try {
      const [testsRes, trendRes] = await Promise.all([
        mockTestsAPI.getMockTests(20),
        mockTestsAPI.getMockTestTrend()
      ]);
      
      const tests = testsRes?.data?.mock_tests || [];
      setMockTests(tests);
      setTrend(trendRes?.data);
      calculateStats(tests);
      
    } catch (error) {
      console.error('Error fetching mock tests:', error);
      showError('Failed to load mock test data');
      
      // Set mock data for demo
      setMockTests(mockMockTests);
      calculateStats(mockMockTests);
      setTrend({
        gs_scores: [85, 92, 88, 95, 98, 102, 108, 112],
        csat_scores: [62, 65, 68, 70, 72, 75, 78, 80],
        dates: ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5', 'Test 6', 'Test 7', 'Test 8']
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tests) => {
    if (!tests.length) return;
    
    const gsScores = tests.map(t => t.gs_score || 0);
    const csatScores = tests.map(t => t.csat_score || 0);
    
    setStats({
      totalTests: tests.length,
      averageGS: Math.round(gsScores.reduce((a, b) => a + b, 0) / tests.length),
      averageCSAT: Math.round(csatScores.reduce((a, b) => a + b, 0) / tests.length),
      bestGS: Math.max(...gsScores),
      bestCSAT: Math.max(...csatScores),
      improvement: tests.length > 1 ? gsScores[gsScores.length - 1] - gsScores[0] : 0
    });
  };

  const handleAddTest = async (testData) => {
    try {
      const response = await mockTestsAPI.saveMockTest(testData);
      if (response?.data?.mock_test) {
        showSuccess('Mock test result added successfully!');
        setShowAddModal(false);
        fetchMockTests();
      }
    } catch (error) {
      showError(error?.message || 'Failed to add mock test');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 150) return '#27ae60';
    if (score >= 120) return '#4a90e2';
    if (score >= 100) return '#f39c12';
    return '#e74c3c';
  };

  const getQualificationStatus = (gsScore, csatScore) => {
    if (gsScore >= 100 && csatScore >= 66) {
      return { text: 'Qualified', color: '#27ae60', icon: 'fas fa-check-circle' };
    }
    if (gsScore >= 90 && csatScore >= 60) {
      return { text: 'Borderline', color: '#f39c12', icon: 'fas fa-exclamation-triangle' };
    }
    return { text: 'Not Qualified', color: '#e74c3c', icon: 'fas fa-times-circle' };
  };

  const mockMockTests = [
    { id: 1, test_name: 'UPSC Prelims 2024 - Test 1', test_date: '2024-01-15', gs_score: 85, csat_score: 62, accuracy: 58, time_taken: 120 },
    { id: 2, test_name: 'UPSC Prelims 2024 - Test 2', test_date: '2024-01-22', gs_score: 92, csat_score: 65, accuracy: 62, time_taken: 118 },
    { id: 3, test_name: 'UPSC Prelims 2024 - Test 3', test_date: '2024-01-29', gs_score: 88, csat_score: 68, accuracy: 60, time_taken: 115 },
    { id: 4, test_name: 'UPSC Prelims 2024 - Test 4', test_date: '2024-02-05', gs_score: 95, csat_score: 70, accuracy: 65, time_taken: 112 },
    { id: 5, test_name: 'UPSC Prelims 2024 - Test 5', test_date: '2024-02-12', gs_score: 98, csat_score: 72, accuracy: 67, time_taken: 110 },
    { id: 6, test_name: 'UPSC Prelims 2024 - Test 6', test_date: '2024-02-19', gs_score: 102, csat_score: 75, accuracy: 70, time_taken: 108 },
    { id: 7, test_name: 'UPSC Prelims 2024 - Test 7', test_date: '2024-02-26', gs_score: 108, csat_score: 78, accuracy: 73, time_taken: 105 },
    { id: 8, test_name: 'UPSC Prelims 2024 - Test 8', test_date: '2024-03-04', gs_score: 112, csat_score: 80, accuracy: 75, time_taken: 102 }
  ];

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Mock Tests | UPSC Learning System</title>
        </Helmet>
        <div className="mocktests-container">
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
        <title>Mock Tests | UPSC Learning System</title>
        <meta name="description" content="Track your mock test performance" />
      </Helmet>

      <div className="mocktests-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-file-alt"></i>
              <span>Mock Tests</span>
            </h1>
            <p className="page-subtitle">
              Track your mock test performance and analyze progress
            </p>
          </div>
          <div className="header-right">
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <i className="fas fa-plus"></i>
              <span>Add Test Result</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
            <div className="stat-value">{stats.totalTests}</div>
            <div className="stat-label">Total Tests</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-bullseye"></i></div>
            <div className="stat-value">{stats.averageGS}</div>
            <div className="stat-label">Avg GS Score</div>
            <div className="stat-trend">Target: 100+</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-calculator"></i></div>
            <div className="stat-value">{stats.averageCSAT}</div>
            <div className="stat-label">Avg CSAT Score</div>
            <div className="stat-trend">Target: 66+</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><i className="fas fa-chart-line"></i></div>
            <div className="stat-value">{stats.improvement > 0 ? `+${stats.improvement}` : stats.improvement}</div>
            <div className="stat-label">Overall Improvement</div>
            <div className={`stat-trend ${stats.improvement > 0 ? 'up' : 'down'}`}>
              {stats.improvement > 0 ? <i className="fas fa-arrow-up"></i> : <i className="fas fa-arrow-down"></i>}
              <span>from first test</span>
            </div>
          </div>
        </div>

        {/* Test History Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-history"></i>
              <span>Test History</span>
            </h3>
            <div className="card-actions">
              <button className="btn-icon" title="Export">
                <i className="fas fa-download"></i>
              </button>
            </div>
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
                    <th>Accuracy</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTests.map((test, index) => {
                    const status = getQualificationStatus(test.gs_score, test.csat_score);
                    return (
                      <tr key={test.id || index}>
                        <td className="test-name">{test.test_name}</td>
                        <td>{formatDate(test.test_date)}</td>
                        <td style={{ color: getScoreColor(test.gs_score), fontWeight: 'bold' }}>
                          {test.gs_score}/200
                        </td>
                        <td style={{ color: test.csat_score >= 66 ? '#27ae60' : '#e74c3c' }}>
                          {test.csat_score}/200
                        </td>
                        <td>{test.gs_score + test.csat_score}/400</td>
                        <td>
                          <div className="accuracy-badge">
                            <span>{test.accuracy || 0}%</span>
                          </div>
                        </td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: `${status.color}20`, color: status.color }}>
                            <i className={status.icon}></i>
                            <span>{status.text}</span>
                          </span>
                        </td>
                        <td>
                          <button className="btn-icon" onClick={() => setSelectedTest(test)}>
                            <i className="fas fa-eye"></i>
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

        {/* Recommendations based on mock tests */}
        {stats.totalTests > 0 && stats.averageGS < 100 && (
          <div className="insight-card">
            <i className="fas fa-lightbulb"></i>
            <div className="insight-content">
              <h4>Mock Test Insight</h4>
              <p>
                Your average GS score is {stats.averageGS}. 
                {stats.averageGS < 80 ? 
                  " Focus on building fundamentals first. Start with NCERTs and basic concepts." :
                  stats.averageGS < 100 ?
                  " You're close to the cutoff! Focus on weak areas identified in your test analysis." :
                  " Great job! Maintain this momentum and focus on revision."
                }
              </p>
            </div>
          </div>
        )}

        {/* Add Test Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Mock Test Result"
          size="large"
        >
          <MockTestForm onSubmit={handleAddTest} onCancel={() => setShowAddModal(false)} />
        </Modal>

        {/* Test Details Modal */}
        {selectedTest && (
          <Modal
            isOpen={!!selectedTest}
            onClose={() => setSelectedTest(null)}
            title={selectedTest.test_name}
            size="large"
          >
            <div className="test-details">
              <div className="details-grid">
                <div className="detail-item">
                  <label>Test Date</label>
                  <span>{formatDate(selectedTest.test_date)}</span>
                </div>
                <div className="detail-item">
                  <label>GS Score</label>
                  <span style={{ color: getScoreColor(selectedTest.gs_score), fontWeight: 'bold' }}>
                    {selectedTest.gs_score}/200
                  </span>
                </div>
                <div className="detail-item">
                  <label>CSAT Score</label>
                  <span>{selectedTest.csat_score}/200</span>
                </div>
                <div className="detail-item">
                  <label>Accuracy</label>
                  <span>{selectedTest.accuracy || 0}%</span>
                </div>
                <div className="detail-item">
                  <label>Time Taken</label>
                  <span>{selectedTest.time_taken || 0} minutes</span>
                </div>
                <div className="detail-item">
                  <label>Questions Attempted</label>
                  <span>{selectedTest.questions_attempted || 0}/100</span>
                </div>
                <div className="detail-item">
                  <label>Correct Answers</label>
                  <span>{selectedTest.correct_answers || 0}</span>
                </div>
                <div className="detail-item">
                  <label>Wrong Answers</label>
                  <span>{selectedTest.wrong_answers || 0}</span>
                </div>
              </div>
              
              {selectedTest.subject_wise_scores && (
                <div className="subject-breakdown">
                  <h4>Subject-wise Performance</h4>
                  <div className="subject-grid">
                    {Object.entries(selectedTest.subject_wise_scores).map(([subject, score]) => (
                      <div key={subject} className="subject-item">
                        <span className="subject-name">{subject}</span>
                        <div className="subject-bar">
                          <div className="subject-fill" style={{ width: `${score}%` }}></div>
                        </div>
                        <span className="subject-score">{score}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default MockTests;