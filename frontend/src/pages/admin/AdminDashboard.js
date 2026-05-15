/**
 * Admin Dashboard Page
 * Overview of system statistics and admin controls
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { adminAPI } from '../../assets/js/api';
import Loader, { CardSkeleton } from '../../components/Common/Loader';
import LineChart from '../../components/Charts/LineChart';
import BarChart from '../../components/Charts/BarChart';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentStudents, setRecentStudents] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await adminAPI.getAdminStats();
      const studentsRes = await adminAPI.getAllStudents(1, 10);
      
      setStats(statsRes?.data);
      setRecentStudents(studentsRes?.data?.students || []);
      
      // Mock performance data for charts
      setPerformanceData({
        registrations: [45, 52, 48, 58, 62, 68, 72, 85, 92, 98, 105, 112],
        averageScores: [42, 45, 48, 52, 55, 58, 62, 65, 68, 70, 72, 75],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      });
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showError('Failed to load admin dashboard data');
      
      // Set mock data for demo
      setStats({
        total_users: 1250,
        total_students: 1180,
        qualified_students: 245,
        qualification_rate: 20.8,
        average_overall_score: 58.5,
        recent_signups: 45,
        active_users: 890,
        total_mock_tests: 3420,
        avg_mock_score: 98.5
      });
      
      setRecentStudents(mockRecentStudents);
      setPerformanceData({
        registrations: [45, 52, 48, 58, 62, 68, 72, 85, 92, 98, 105, 112],
        averageScores: [42, 45, 48, 52, 55, 58, 62, 65, 68, 70, 72, 75],
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      });
    } finally {
      setLoading(false);
    }
  };

  const mockRecentStudents = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@example.com', registered_at: '2024-03-15', overall_score: 62, status: 'active' },
    { id: 2, name: 'Priya Sharma', email: 'priya@example.com', registered_at: '2024-03-14', overall_score: 71, status: 'active' },
    { id: 3, name: 'Amit Patel', email: 'amit@example.com', registered_at: '2024-03-13', overall_score: 48, status: 'inactive' },
    { id: 4, name: 'Neha Gupta', email: 'neha@example.com', registered_at: '2024-03-12', overall_score: 75, status: 'active' },
    { id: 5, name: 'Vikram Singh', email: 'vikram@example.com', registered_at: '2024-03-11', overall_score: 55, status: 'active' }
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users || 0,
      icon: 'fas fa-users',
      color: '#4a90e2',
      trend: `+${stats?.recent_signups || 0} this week`
    },
    {
      title: 'Active Students',
      value: stats?.active_users || 0,
      icon: 'fas fa-user-graduate',
      color: '#27ae60',
      trend: `${Math.round((stats?.active_users / stats?.total_users) * 100) || 0}% of total`
    },
    {
      title: 'Qualified Students',
      value: stats?.qualified_students || 0,
      icon: 'fas fa-trophy',
      color: '#f39c12',
      trend: `${stats?.qualification_rate || 0}% qualification rate`
    },
    {
      title: 'Avg Overall Score',
      value: `${stats?.average_overall_score || 0}%`,
      icon: 'fas fa-chart-line',
      color: '#9b59b6',
      trend: 'Across all students'
    },
    {
      title: 'Total Mock Tests',
      value: stats?.total_mock_tests || 0,
      icon: 'fas fa-file-alt',
      color: '#e74c3c',
      trend: `Avg ${stats?.avg_mock_score || 0}/200`
    },
    {
      title: 'Avg Study Hours',
      value: '6.2',
      icon: 'fas fa-clock',
      color: '#1abc9c',
      trend: 'Hours per day'
    }
  ];

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Admin Dashboard | UPSC Learning System</title>
        </Helmet>
        <div className="admin-container">
          <div className="page-header">
            <CardSkeleton />
          </div>
          <div className="stats-grid">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
          <div className="row">
            <div className="col-md-6"><CardSkeleton /></div>
            <div className="col-md-6"><CardSkeleton /></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | UPSC Learning System</title>
        <meta name="description" content="Admin dashboard for UPSC Learning System" />
      </Helmet>

      <div className="admin-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-chart-line"></i>
              <span>Admin Dashboard</span>
            </h1>
            <p className="page-subtitle">
              Welcome back, {user?.full_name || user?.username}! Here's your system overview.
            </p>
          </div>
          <div className="header-right">
            <button className="btn btn-outline" onClick={() => window.print()}>
              <i className="fas fa-print"></i>
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <i className={stat.icon}></i>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.title}</div>
              <div className="stat-trend">{stat.trend}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="row two-column-layout">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Monthly Registrations</h3>
            </div>
            <div className="chart-body">
              <BarChart
                data={[{
                  label: 'New Users',
                  values: performanceData?.registrations || [],
                  backgroundColor: '#4a90e2'
                }]}
                labels={performanceData?.months || []}
                yLabel="Number of Users"
                height={300}
              />
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Average Student Performance Trend</h3>
            </div>
            <div className="chart-body">
              <LineChart
                data={[{
                  label: 'Avg Score',
                  values: performanceData?.averageScores || [],
                  borderColor: '#27ae60',
                  backgroundColor: 'rgba(39, 174, 96, 0.1)'
                }]}
                labels={performanceData?.months || []}
                yLabel="Score (%)"
                height={300}
              />
            </div>
          </div>
        </div>

        {/* Recent Students Table */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <i className="fas fa-user-plus"></i>
              <span>Recent Student Registrations</span>
            </h3>
            <Link to="/admin/students" className="btn-link">
              View All Students <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered</th>
                    <th>Overall Score</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="student-name">
                        <div className="student-avatar">
                          {student.name?.charAt(0) || 'S'}
                        </div>
                        <span>{student.name}</span>
                      </td>
                      <td>{student.email}</td>
                      <td>{new Date(student.registered_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`score-badge ${student.overall_score >= 60 ? 'high' : student.overall_score >= 40 ? 'medium' : 'low'}`}>
                          {student.overall_score || '-'}%
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${student.status === 'active' ? 'active' : 'inactive'}`}>
                          {student.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/students/${student.id}`} className="action-btn view">
                          <i className="fas fa-eye"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="fas fa-bolt"></i>
                <span>Quick Actions</span>
              </h3>
            </div>
            <div className="card-body">
              <div className="actions-grid">
                <Link to="/admin/students" className="action-card">
                  <i className="fas fa-users"></i>
                  <span>Manage Students</span>
                </Link>
                <Link to="/admin/stats" className="action-card">
                  <i className="fas fa-chart-pie"></i>
                  <span>View Statistics</span>
                </Link>
                <button className="action-card" onClick={() => window.location.href = '/api/v1/admin/export'}>
                  <i className="fas fa-download"></i>
                  <span>Export Data</span>
                </button>
                <button className="action-card" onClick={() => showError('Coming soon!')}>
                  <i className="fas fa-envelope"></i>
                  <span>Send Newsletter</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;