/**
 * Analytics Page
 * Comprehensive performance analytics and insights
 */

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { analyticsAPI, scoresAPI, mockTestsAPI } from '../../assets/js/api';
import Loader, { CardSkeleton, ChartSkeleton } from '../../components/Common/Loader';
import LineChart from '../../components/Charts/LineChart';
import BarChart, { SubjectScoresChart, ComparisonBarChart } from '../../components/Charts/BarChart';
import PieChart, { SubjectDistributionChart, CategoryBreakdownChart } from '../../components/Charts/PieChart';
import RadarChart, { SubjectPerformanceRadar, ComparativeRadarChart } from '../../components/Charts/RadarChart';
import TrendChart, { MockTestTrendChart } from '../../components/Charts/TrendChart';

const Analytics = () => {
  const { user, studentProfile } = useAuth();
  const { showError, showInfo } = useNotification();
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, all
  const [testTypeFilter, setTestTypeFilter] = useState('gs');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [performanceTrend, setPerformanceTrend] = useState(null);
  const [weaknessAnalysis, setWeaknessAnalysis] = useState(null);
  const [successProbability, setSuccessProbability] = useState(null);
  const [subjectScores, setSubjectScores] = useState({});
  const [mockTestTrend, setMockTestTrend] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Helper function to safely fetch data without throwing errors to the main block
      const fetchSafely = async (apiFunc, defaultData = null) => {
        try {
          const res = await apiFunc();
          return res?.data || defaultData;
        } catch (error) {
          console.warn(`API call failed silently:`, error);
          return defaultData;
        }
      };

      // Fetch all analytics data independently
      const performanceTrend = await fetchSafely(analyticsAPI.getPerformanceTrend);
      const weaknessAnalysis = await fetchSafely(analyticsAPI.getWeaknessAnalysis);
      const successProbability = await fetchSafely(analyticsAPI.getSuccessProbability);
      const scoresRes = await fetchSafely(scoresAPI.getLatestScores);
      const mockTestTrend = await fetchSafely(mockTestsAPI.getMockTestTrend);

      // Set the state with actual data (or null/empty objects if they failed)
      setPerformanceTrend(performanceTrend);
      setWeaknessAnalysis(weaknessAnalysis);
      setSuccessProbability(successProbability);
      setSubjectScores(scoresRes?.scores || {});
      setMockTestTrend(mockTestTrend);
      
      // Generate comparison data dynamically based on real scores
      const yourScore = scoresRes?.scores?.overall_score || 0;
      setComparisonData({
        peer_average: 62.5,
        top_performer: 85.3,
        your_score: yourScore,
        percentile: yourScore > 0 ? Math.round((yourScore / 85.3) * 100) : 0
      });
      
    } catch (error) {
      console.error('Critical error fetching analytics data:', error);
      showError('Failed to load analytics dashboard');
      // DO NOT call setMockAnalyticsData() here anymore, let it show empty states
    } finally {
      setLoading(false);
    }
  };

  /*const setMockAnalyticsData = () => {
    setPerformanceTrend({
      trend: 'Improving',
      improvement_rate: 8.5,
      best_score: 72,
      worst_score: 45,
      average_score: 58.3,
      scores_over_time: [
        { date: 'Week 1', score: 45, moving_avg: 45 },
        { date: 'Week 2', score: 48, moving_avg: 46.5 },
        { date: 'Week 3', score: 52, moving_avg: 48.3 },
        { date: 'Week 4', score: 58, moving_avg: 52.7 },
        { date: 'Week 5', score: 62, moving_avg: 57.3 },
        { date: 'Week 6', score: 68, moving_avg: 62.7 },
        { date: 'Week 7', score: 72, moving_avg: 67.3 },
        { date: 'Week 8', score: 75, moving_avg: 71.7 }
      ]
    });
    
    setWeaknessAnalysis({
      weak_subjects: {
        'Economy': { score: 42, severity: 'high', priority: 1, improvement_needed: 28 },
        'Science_Technology': { score: 48, severity: 'high', priority: 1, improvement_needed: 22 },
        'Geography': { score: 55, severity: 'medium', priority: 2, improvement_needed: 15 }
      },
      weak_count: 3,
      high_priority_count: 2,
      medium_priority_count: 1,
      low_priority_count: 0
    });
    
    setSuccessProbability({
      probability: 58.5,
      category: 'Medium',
      message: 'You need focused effort in weak areas to improve your chances.',
      factors: {
        score_factor: 42,
        study_factor: 65,
        mock_factor: 45,
        consistency_factor: 70
      }
    });
    
    setSubjectScores({
      history_score: 65,
      geography_score: 55,
      polity_score: 70,
      economy_score: 42,
      science_tech_score: 48,
      environment_score: 60,
      current_affairs_score: 68,
      art_culture_score: 58,
      comprehension_score: 72,
      logical_reasoning_score: 68,
      quantitative_score: 45,
      data_interpretation_score: 58,
      decision_making_score: 62,
      overall_score: 58.5
    });
    
    setMockTestTrend({
      gs_scores: [85, 92, 88, 95, 98, 102, 108, 112],
      csat_scores: [62, 65, 68, 70, 72, 75, 78, 80],
      dates: ['Test 1', 'Test 2', 'Test 3', 'Test 4', 'Test 5', 'Test 6', 'Test 7', 'Test 8']
    });
    
    setComparisonData({
      peer_average: 62.5,
      top_performer: 85.3,
      your_score: 58.5,
      percentile: 42
    });
  }; */

  // Line chart for performance trend   

  const getChartLabels = () => {
    if (!performanceTrend?.scores_over_time) return [];
    return performanceTrend.scores_over_time.map(item => item.date);
  };

  const getChartScores = () => {
    if (!performanceTrend?.scores_over_time) return [];
    return performanceTrend.scores_over_time.map(item => item.score);
  };

  const getMovingAvg = () => {
    if (!performanceTrend?.scores_over_time) return [];
    return performanceTrend.scores_over_time.map(item => item.moving_avg);
  };

  const renderOverviewTab = () => (
    <div className="analytics-tab-content">
      {/* Performance Trend Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Performance Trend</h3>
          <div className="chart-actions">
            <button 
              className={`chart-action-btn ${timeRange === 'week' ? 'active' : ''}`}
              onClick={() => setTimeRange('week')}
            >
              Week
            </button>
            <button 
              className={`chart-action-btn ${timeRange === 'month' ? 'active' : ''}`}
              onClick={() => setTimeRange('month')}
            >
              Month
            </button>
            <button 
              className={`chart-action-btn ${timeRange === 'all' ? 'active' : ''}`}
              onClick={() => setTimeRange('all')}
            >
              All
            </button>
          </div>
        </div>
        <div className="chart-body">
          <LineChart
            data={[
              {
                label: 'Actual Score',
                values: getChartScores(),
                borderColor: '#4a90e2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)'
              },
              {
                label: 'Moving Average',
                values: getMovingAvg(),
                borderColor: '#f39c12',
                backgroundColor: 'transparent',
                borderDash: [5, 5]
              }
            ]}
            labels={getChartLabels()}
            yLabel="Score (%)"
            height={350}
          />
        </div>
        <div className="chart-footer">
          <div className="insight-box">
            <i className="fas fa-chart-line"></i>
            <div className="insight-content">
              <strong>Trend Analysis:</strong> Your performance is 
              <span style={{ color: performanceTrend?.improvement_rate > 0 ? '#27ae60' : '#e74c3c' }}>
                {performanceTrend?.improvement_rate > 0 ? ' improving' : ' declining'}
              </span>
              by {Math.abs(performanceTrend?.improvement_rate || 0)}% over the last {performanceTrend?.scores_over_time?.length || 0} weeks.
            </div>
          </div>
        </div>
      </div>

      {/* Subject Performance Radar */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Subject-wise Performance</h3>
        </div>
        <div className="chart-body">
          <SubjectPerformanceRadar 
            scores={{
              'History': subjectScores.history_score || 0,
              'Geography': subjectScores.geography_score || 0,
              'Polity': subjectScores.polity_score || 0,
              'Economy': subjectScores.economy_score || 0,
              'Science & Tech': subjectScores.science_tech_score || 0,
              'Environment': subjectScores.environment_score || 0,
              'Current Affairs': subjectScores.current_affairs_score || 0,
              'Art & Culture': subjectScores.art_culture_score || 0
            }}
            height={400}
          />
        </div>
      </div>

      {/* Success Probability Gauge */}
      <div className="stats-grid-two">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Qualification Probability</h3>
          </div>
          <div className="probability-gauge">
            <div className="gauge-container">
              <div className="gauge-value" style={{ 
                background: `conic-gradient(
                  ${successProbability?.probability >= 70 ? '#27ae60' : 
                    successProbability?.probability >= 40 ? '#f39c12' : '#e74c3c'} 
                  0deg ${(successProbability?.probability || 0) * 3.6}deg,
                  #e0e0e0 ${(successProbability?.probability || 0) * 3.6}deg 360deg
                )`
              }}>
                <div className="gauge-inner">
                  <span className="gauge-percent">{Math.round(successProbability?.probability || 0)}%</span>
                </div>
              </div>
            </div>
            <div className="gauge-info">
              <div className={`probability-badge ${successProbability?.category?.toLowerCase()}`}>
                {successProbability?.category} Chance
              </div>
              <p className="gauge-message">{successProbability?.message}</p>
            </div>
          </div>
        </div>

        {/* Factor Analysis */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Success Factor Analysis</h3>
          </div>
          <div className="factor-analysis">
            <div className="factor-item">
              <div className="factor-label">
                <i className="fas fa-graduation-cap"></i>
                <span>Subject Knowledge</span>
              </div>
              <div className="factor-bar">
                <div className="factor-fill" style={{ width: `${successProbability?.factors?.score_factor || 0}%` }}></div>
              </div>
              <span className="factor-value">{successProbability?.factors?.score_factor || 0}%</span>
            </div>
            <div className="factor-item">
              <div className="factor-label">
                <i className="fas fa-clock"></i>
                <span>Study Consistency</span>
              </div>
              <div className="factor-bar">
                <div className="factor-fill" style={{ width: `${successProbability?.factors?.consistency_factor || 0}%` }}></div>
              </div>
              <span className="factor-value">{successProbability?.factors?.consistency_factor || 0}%</span>
            </div>
            <div className="factor-item">
              <div className="factor-label">
                <i className="fas fa-file-alt"></i>
                <span>Mock Test Practice</span>
              </div>
              <div className="factor-bar">
                <div className="factor-fill" style={{ width: `${successProbability?.factors?.mock_factor || 0}%` }}></div>
              </div>
              <span className="factor-value">{successProbability?.factors?.mock_factor || 0}%</span>
            </div>
            <div className="factor-item">
              <div className="factor-label">
                <i className="fas fa-chart-line"></i>
                <span>Study Efficiency</span>
              </div>
              <div className="factor-bar">
                <div className="factor-fill" style={{ width: `${successProbability?.factors?.study_factor || 0}%` }}></div>
              </div>
              <span className="factor-value">{successProbability?.factors?.study_factor || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubjectsTab = () => (
    <div className="analytics-tab-content">
      {/* Subject Scores Bar Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Subject-wise Scores</h3>
        </div>
        <div className="chart-body">
          <SubjectScoresChart 
            scores={{
              'History': subjectScores.history_score || 0,
              'Geography': subjectScores.geography_score || 0,
              'Polity': subjectScores.polity_score || 0,
              'Economy': subjectScores.economy_score || 0,
              'Science & Tech': subjectScores.science_tech_score || 0,
              'Environment': subjectScores.environment_score || 0,
              'Current Affairs': subjectScores.current_affairs_score || 0,
              'Art & Culture': subjectScores.art_culture_score || 0
            }}
            height={400}
          />
        </div>
      </div>

      {/* CSAT Subjects */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">CSAT Subject-wise Performance</h3>
        </div>
        <div className="chart-body">
          <SubjectScoresChart 
            scores={{
              'Comprehension': subjectScores.comprehension_score || 0,
              'Logical Reasoning': subjectScores.logical_reasoning_score || 0,
              'Quantitative Aptitude': subjectScores.quantitative_score || 0,
              'Data Interpretation': subjectScores.data_interpretation_score || 0,
              'Decision Making': subjectScores.decision_making_score || 0
            }}
            height={350}
          />
        </div>
        <div className="chart-footer">
          <div className="insight-box warning">
            <i className="fas fa-exclamation-triangle"></i>
            <div className="insight-content">
              <strong>CSAT Alert:</strong> CSAT is qualifying in nature. You need at least 33% (66/200) to qualify.
              {subjectScores.quantitative_score < 50 && " Focus on Quantitative Aptitude as it's a common challenge area."}
            </div>
          </div>
        </div>
      </div>

      {/* Weak Areas Detail */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Weak Areas Analysis</h3>
        </div>
        <div className="weakness-detail">
          {weaknessAnalysis?.weak_subjects && Object.keys(weaknessAnalysis.weak_subjects).length > 0 ? (
            Object.entries(weaknessAnalysis.weak_subjects).map(([subject, details]) => (
              <div key={subject} className={`weakness-detail-item ${details.severity}`}>
                <div className="weakness-detail-header">
                  <div className="weakness-detail-title">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{subject.replace('_', ' ')}</span>
                  </div>
                  <div className="weakness-detail-score">{details.score}%</div>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${details.severity}`} style={{ width: `${details.score}%` }}></div>
                </div>
                <div className="weakness-detail-info">
                  <div className="info-item">
                    <i className="fas fa-bullseye"></i>
                    <span>Improvement Needed: {details.improvement_needed}%</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span>Estimated Hours: {details.improvement_needed * 2} hours</span>
                  </div>
                </div>
                <button className="btn-improve">
                  Get Improvement Plan <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <i className="fas fa-check-circle"></i>
              <p>Great job! No major weaknesses detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMockTestsTab = () => {
    const currentTestData = mockTestTrend?.[testTypeFilter] || { scores: [], dates: [] };
    const maxScore = 200; 
    
    const totalTests = currentTestData.scores.length;
    const last3Avg = totalTests > 0 
      ? Math.round(currentTestData.scores.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, totalTests)) 
      : 0;
    const overallImprovement = totalTests > 1 
      ? Math.round(currentTestData.scores[totalTests - 1] - currentTestData.scores[0]) 
      : 0;

    return (
      <div className="analytics-tab-content">
        {/* Toggle Switch GS / CSAT - Wrapped inside native theme containers */}
        <div className="chart-card" style={{ marginBottom: '20px' }}>
          <div className="chart-header" style={{ borderBottom: 'none' }}>
            <h3 className="chart-title">Select Test Component</h3>
            <div className="chart-actions">
              <button 
                className={`chart-action-btn ${testTypeFilter === 'gs' ? 'active' : ''}`}
                onClick={() => setTestTypeFilter('gs')}
              >
                General Studies (GS)
              </button>
              <button 
                className={`chart-action-btn ${testTypeFilter === 'csat' ? 'active' : ''}`}
                onClick={() => setTestTypeFilter('csat')}
              >
                CSAT Aptitude
              </button>
            </div>
          </div>
        </div>

        {/* Mock Test Trend Line Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">{testTypeFilter.toUpperCase()} Performance Trend</h3>
          </div>
          <div className="chart-body">
            {totalTests > 0 ? (
              <LineChart
                data={[
                  {
                    label: `${testTypeFilter.toUpperCase()} Score`,
                    values: currentTestData.scores,
                    borderColor: testTypeFilter === 'gs' ? '#4a90e2' : '#27ae60',
                    backgroundColor: testTypeFilter === 'gs' ? 'rgba(74, 144, 226, 0.1)' : 'rgba(39, 174, 96, 0.1)'
                  }
                ]}
                labels={currentTestData.dates}
                yLabel={`Score (out of ${maxScore})`}
                height={350}
              />
            ) : (
               <div className="empty-state text-center p-5">
                 <i className="fas fa-clipboard-list text-muted fa-3x mb-3"></i>
                 <p style={{ margin: '15px 0 0 0' }}>No {testTypeFilter.toUpperCase()} mock tests recorded yet.</p>
               </div>
            )}
          </div>
        </div>

        {/* Mock Test Stat Analysis Cards */}
        <div className="stats-grid-two">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">{testTypeFilter.toUpperCase()} Metrics</h3>
            </div>
            <div className="test-analysis">
              <div className="analysis-item">
                <div className="analysis-value">{totalTests}</div>
                <div className="analysis-label">Tests Taken</div>
              </div>
              <div className="analysis-item">
                <div className="analysis-value">{last3Avg}</div>
                <div className="analysis-label">Last 3 Tests Avg</div>
              </div>
              <div className="analysis-item">
                <div className="analysis-value" style={{ color: overallImprovement >= 0 ? '#27ae60' : '#e74c3c' }}>
                  {overallImprovement > 0 ? '+' : ''}{overallImprovement}
                </div>
                <div className="analysis-label">Overall Improvement</div>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">AI Preparation Insights</h3>
            </div>
            <div className="test-recommendations">
              <ul>
                {testTypeFilter === 'csat' && last3Avg < 66 && totalTests > 0 && (
                  <li style={{ color: '#e74c3c', marginBottom: '10px' }}>
                    <i className="fas fa-exclamation-triangle"></i>
                    <span><strong>Alert:</strong> Your average is below the 33% (66 marks) qualification threshold!</span>
                  </li>
                )}
                <li>
                  <i className="fas fa-chart-line"></i>
                  <span>Maintain a steady schedule of 2 {testTypeFilter.toUpperCase()} tests a week.</span>
                </li>
                <li>
                  <i className="fas fa-clock"></i>
                  <span>Dedicate time to evaluating unattempted questions.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

      

  const renderComparisonTab = () => (
    <div className="analytics-tab-content">
      {/* Comparison Cards */}
      <div className="comparison-stats">
        <div className="comparison-card">
          <div className="comparison-icon">
            <i className="fas fa-user"></i>
          </div>
          <div className="comparison-info">
            <span className="comparison-label">Your Score</span>
            <span className="comparison-value">{comparisonData?.your_score || 0}%</span>
          </div>
        </div>
        <div className="comparison-card">
          <div className="comparison-icon">
            <i className="fas fa-users"></i>
          </div>
          <div className="comparison-info">
            <span className="comparison-label">Peer Average</span>
            <span className="comparison-value">{comparisonData?.peer_average || 0}%</span>
          </div>
        </div>
        <div className="comparison-card">
          <div className="comparison-icon">
            <i className="fas fa-trophy"></i>
          </div>
          <div className="comparison-info">
            <span className="comparison-label">Top Performer</span>
            <span className="comparison-value">{comparisonData?.top_performer || 0}%</span>
          </div>
        </div>
        <div className="comparison-card">
          <div className="comparison-icon">
            <i className="fas fa-chart-line"></i>
          </div>
          <div className="comparison-info">
            <span className="comparison-label">Your Percentile</span>
            <span className="comparison-value">{comparisonData?.percentile || 0}th</span>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Your Performance vs Peers</h3>
        </div>
        <div className="chart-body">
          <ComparisonBarChart
            current={[
              comparisonData?.your_score || 0,
              comparisonData?.your_score || 0,
              comparisonData?.your_score || 0
            ]}
            target={[
              comparisonData?.peer_average || 0,
              comparisonData?.top_performer || 0,
              75
            ]}
            labels={['Peer Average', 'Top Performer', 'Target Score']}
            height={350}
          />
        </div>
      </div>

      {/* Improvement Gap */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Improvement Gap Analysis</h3>
        </div>
        <div className="gap-analysis">
          <div className="gap-item">
            <div className="gap-label">To Reach Peer Average</div>
            <div className="gap-bar">
              <div className="gap-fill" style={{ width: `${Math.min(100, ((comparisonData?.your_score || 0) / (comparisonData?.peer_average || 1)) * 100)}%` }}></div>
            </div>
            <div className="gap-value">{Math.abs((comparisonData?.peer_average || 0) - (comparisonData?.your_score || 0)).toFixed(1)}% needed</div>
          </div>
          <div className="gap-item">
            <div className="gap-label">To Reach Top Performer</div>
            <div className="gap-bar">
              <div className="gap-fill" style={{ width: `${Math.min(100, ((comparisonData?.your_score || 0) / (comparisonData?.top_performer || 1)) * 100)}%` }}></div>
            </div>
            <div className="gap-value">{Math.abs((comparisonData?.top_performer || 0) - (comparisonData?.your_score || 0)).toFixed(1)}% needed</div>
          </div>
          <div className="gap-item">
            <div className="gap-label">To Reach Safe Score (75%)</div>
            <div className="gap-bar">
              <div className="gap-fill" style={{ width: `${Math.min(100, ((comparisonData?.your_score || 0) / 75) * 100)}%` }}></div>
            </div>
            <div className="gap-value">{Math.max(0, 75 - (comparisonData?.your_score || 0)).toFixed(1)}% needed</div>
          </div>
        </div>
        <div className="chart-footer">
          <div className="insight-box">
            <i className="fas fa-lightbulb"></i>
            <div className="insight-content">
              <strong>Insight:</strong> Focus on the subjects where you're below average. A targeted approach can help you bridge the gap faster.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Analytics | UPSC Learning System</title>
        </Helmet>
        <div className="analytics-container">
          <div className="analytics-header">
            <CardSkeleton />
          </div>
          <div className="analytics-tabs">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics | UPSC Learning System</title>
        <meta name="description" content="Detailed performance analytics for your UPSC preparation" />
      </Helmet>

      <div className="analytics-container">
        {/* Header */}
        <div className="analytics-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-chart-line"></i>
              <span>Performance Analytics</span>
            </h1>
            <p className="page-subtitle">
              Track your progress, identify patterns, and make data-driven decisions
            </p>
          </div>
          <div className="header-right">
            <button className="btn btn-outline" onClick={() => window.print()}>
              <i className="fas fa-print"></i>
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="analytics-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-chart-pie"></i>
            <span>Overview</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <i className="fas fa-book"></i>
            <span>Subjects</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'mocktests' ? 'active' : ''}`}
            onClick={() => setActiveTab('mocktests')}
          >
            <i className="fas fa-file-alt"></i>
            <span>Mock Tests</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            <i className="fas fa-chart-simple"></i>
            <span>Comparison</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'subjects' && renderSubjectsTab()}
        {activeTab === 'mocktests' && renderMockTestsTab()}
        {activeTab === 'comparison' && renderComparisonTab()}
      </div>
    </>
  );
};

export default Analytics;