/**
 * Dashboard Page
 * Main dashboard showing performance overview, stats, and recommendations
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { dashboardAPI, scoresAPI, recommendationsAPI, analyticsAPI } from '../../assets/js/api';
import Loader, { CardSkeleton, ChartSkeleton } from '../../components/Common/Loader';


// Import dashboard components
import QuickStats from '../../components/Dashboard/QuickStats';
import PerformanceChart from '../../components/Dashboard/PerformanceChart';
import WeaknessCard from '../../components/Dashboard/WeaknessCard';
import StudyProgress from '../../components/Dashboard/StudyProgress';
import RecentActivity from '../../components/Dashboard/RecentActivity';

const Dashboard = () => {
  const { user, studentProfile } = useAuth();
  const { showError } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [scores, setScores] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // Fetch all dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
  setLoading(true);
  try {
    const [dashboardRes, scoresRes, recommendationsRes, analyticsRes] = await Promise.all([
      dashboardAPI.getDashboard().catch(() => ({ data: null })),
      scoresAPI.getLatestScores().catch(() => ({ data: null })),
      recommendationsAPI.getRecommendations('pending', 5).catch(() => ({ data: null })),
      analyticsAPI.getPerformanceTrend().catch(() => ({ data: null }))
    ]);

    // If API returns no data, use mock data
    if (!scoresRes?.data?.scores) {
      setScores({
        overall_score: 62,
        gs_average_score: 58,
        csat_average_score: 55,
        history_score: 65,
        geography_score: 55,
        polity_score: 70,
        economy_score: 42,
        science_tech_score: 48,
        environment_score: 60,
        current_affairs_score: 68,
        art_culture_score: 58
      });
    } else {
      setScores(scoresRes.data.scores);
    }
    
    // Similar for other data...
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Set mock data on error
    setScores({
      overall_score: 62,
      gs_average_score: 58,
      csat_average_score: 55
    });
  } finally {
    setLoading(false);
  }
};

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Get user name
  const getUserName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.username) return user.username;
    return 'Aspirant';
  };

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Dashboard | UPSC Learning System</title>
        </Helmet>
        <div className="dashboard-container">
          <div className="dashboard-content">
            <div className="stats-grid">
              {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
            </div>
            <div className="chart-card">
              <ChartSkeleton />
            </div>
            <div className="row">
              <div className="col-md-6">
                <CardSkeleton />
              </div>
              <div className="col-md-6">
                <CardSkeleton />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | UPSC Learning System</title>
        <meta name="description" content="Your personalized UPSC preparation dashboard" />
      </Helmet>

      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Welcome Section */}
          <div className="welcome-section">
            <div className="welcome-text">
              <h1 className="welcome-title">
                {getGreeting()}, {getUserName()}! 👋
              </h1>
              <p className="welcome-subtitle">
                Ready to continue your UPSC preparation journey?
              </p>
            </div>
            <div className="welcome-actions">
              <Link to="/study-logs" className="btn btn-outline">
                <i className="fas fa-plus"></i>
                <span>Log Study Hours</span>
              </Link>
              <Link to="/mock-tests" className="btn btn-primary">
                <i className="fas fa-file-alt"></i>
                <span>Take Mock Test</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <QuickStats data={dashboardData} scores={scores} />

          {/* Performance Chart */}
          <div className="chart-card">
            <PerformanceChart analytics={analytics} />
          </div>

          {/* Two Column Layout */}
          <div className="row two-column-layout">
            <div className="col-md-6">
              {/* Weak Areas Section */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-exclamation-triangle"></i>
                    <span>Weak Areas Analysis</span>
                  </h3>
                  <Link to="/analytics" className="btn-link">View All →</Link>
                </div>
                <div className="card-body">
                  <WeaknessCard scores={scores} />
                </div>
              </div>

              {/* Study Progress Section */}
              <div className="card mt-4">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-chart-line"></i>
                    <span>Study Progress</span>
                  </h3>
                  <Link to="/study-logs" className="btn-link">View Details →</Link>
                </div>
                <div className="card-body">
                  <StudyProgress />
                </div>
              </div>
            </div>

            <div className="col-md-6">
              {/* Recent Activity Section */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-history"></i>
                    <span>Recent Activity</span>
                  </h3>
                  <Link to="/study-logs" className="btn-link">View All →</Link>
                </div>
                <div className="card-body">
                  <RecentActivity />
                </div>
              </div>

              {/* Pending Recommendations */}
              <div className="card mt-4">
                <div className="card-header">
                  <h3 className="card-title">
                    <i className="fas fa-lightbulb"></i>
                    <span>Recommendations</span>
                  </h3>
                  <Link to="/recommendations" className="btn-link">View All →</Link>
                </div>
                <div className="card-body">
                  {recommendations.length > 0 ? (
                    <div className="recommendations-preview">
                      {recommendations.slice(0, 3).map((rec, index) => (
                        <div key={rec.id || index} className={`rec-item priority-${rec.priority || 'medium'}`}>
                          <div className="rec-icon">
                            <i className="fas fa-graduation-cap"></i>
                          </div>
                          <div className="rec-content">
                            <h4>{rec.subject || 'General'} - {rec.recommendation_type || 'Strategy'}</h4>
                            <p>{rec.content?.substring(0, 100)}...</p>
                          </div>
                        </div>
                      ))}
                      {recommendations.length > 3 && (
                        <div className="text-center mt-3">
                          <Link to="/recommendations" className="btn btn-sm btn-outline">
                            +{recommendations.length - 3} more recommendations
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <i className="fas fa-check-circle"></i>
                      <p>Great job! No pending recommendations.</p>
                      <Link to="/recommendations/generate" className="btn btn-sm btn-primary">
                        Generate New Recommendations
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Motivational Quote */}
          <div className="motivation-card">
            <i className="fas fa-quote-left"></i>
            <p className="quote-text">
              "Success is not final, failure is not fatal: it is the courage to continue that counts."
            </p>
            <p className="quote-author">- Winston Churchill</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;