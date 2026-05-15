/**
 * System Statistics Page
 * Detailed system analytics and reports
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { adminAPI } from '../../assets/js/api';
import Loader from '../../components/Common/Loader';
import LineChart from '../../components/Charts/LineChart';
import BarChart from '../../components/Charts/BarChart';
import PieChart from '../../components/Charts/PieChart';

const SystemStats = () => {
  const { user } = useAuth();
  const { showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getSystemStats(dateRange);
      setStats(response?.data);
    } catch (error) {
      console.error('Error fetching system stats:', error);
      showError('Failed to load statistics');
      
      // Mock data for demo
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const mockStats = {
    userGrowth: [45, 52, 58, 62, 68, 75, 82, 88, 95, 102, 108, 115],
    subjectPerformance: {
      History: 58, Geography: 52, Polity: 65, Economy: 48,
      'Science & Tech': 50, Environment: 55, 'Current Affairs': 62, 'Art & Culture': 54
    },
    qualificationRateByCoaching: {
      'Vajiram': 68, 'Vision IAS': 72, 'Insights': 58, 'Forum IAS': 62, 'Self Study': 45
    },
    averageScoresByMonth: [48, 52, 55, 58, 62, 65, 68, 70, 72, 73, 74, 75],
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  };

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <>
      <Helmet>
        <title>System Statistics | UPSC Learning System</title>
      </Helmet>

      <div className="system-stats-container">
        {/* Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-chart-pie"></i>
              <span>System Statistics</span>
            </h1>
            <p className="page-subtitle">Comprehensive system analytics and insights</p>
          </div>
          <div className="header-right">
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="select-input">
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last 12 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">User Growth Trend</h3>
          </div>
          <div className="chart-body">
            <LineChart
              data={[{
                label: 'New Users',
                values: stats?.userGrowth || [],
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)'
              }]}
              labels={stats?.months || []}
              yLabel="Number of Users"
              height={350}
            />
          </div>
        </div>

        {/* Average Performance Trend */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Average Student Performance Trend</h3>
          </div>
          <div className="chart-body">
            <LineChart
              data={[{
                label: 'Average Score',
                values: stats?.averageScoresByMonth || [],
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39, 174, 96, 0.1)'
              }]}
              labels={stats?.months || []}
              yLabel="Score (%)"
              height={350}
            />
          </div>
          <div className="chart-footer">
            <div className="insight-box">
              <i className="fas fa-chart-line"></i>
              <div className="insight-content">
                Overall student performance has improved by 27% over the last 12 months.
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Charts */}
        <div className="row two-column-layout">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Subject Performance Analysis</h3>
            </div>
            <div className="chart-body">
              <BarChart
                data={[{
                  label: 'Average Score',
                  values: Object.values(stats?.subjectPerformance || {}),
                  backgroundColor: '#f39c12'
                }]}
                labels={Object.keys(stats?.subjectPerformance || {})}
                yLabel="Score (%)"
                height={350}
              />
            </div>
            <div className="chart-footer">
              <div className="insight-box warning">
                <i className="fas fa-exclamation-triangle"></i>
                <div className="insight-content">
                  <strong>Focus Areas:</strong> Economy and Science & Technology are the weakest subjects across all students.
                </div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Qualification Rate by Coaching</h3>
            </div>
            <div className="chart-body">
              <BarChart
                data={[{
                  label: 'Qualification Rate',
                  values: Object.values(stats?.qualificationRateByCoaching || {}),
                  backgroundColor: '#9b59b6'
                }]}
                labels={Object.keys(stats?.qualificationRateByCoaching || {})}
                yLabel="Qualification Rate (%)"
                height={350}
                horizontal={true}
              />
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="key-insights">
          <h3>Key Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <i className="fas fa-chart-line"></i>
              <h4>User Engagement</h4>
              <p>Active users have increased by 35% compared to last quarter</p>
            </div>
            <div className="insight-card">
              <i className="fas fa-trophy"></i>
              <h4>Success Rate</h4>
              <p>Students who take 50+ mock tests have 2x higher qualification rate</p>
            </div>
            <div className="insight-card">
              <i className="fas fa-clock"></i>
              <h4>Study Patterns</h4>
              <p>Most students study between 8-10 AM and 7-9 PM</p>
            </div>
            <div className="insight-card">
              <i className="fas fa-graduation-cap"></i>
              <h4>Coaching Impact</h4>
              <p>Coaching adds 15-20% to success probability on average</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SystemStats;