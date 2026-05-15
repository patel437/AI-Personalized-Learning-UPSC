/**
 * PerformanceChart Component
 * Shows performance trend over time
 */

import React, { useState } from 'react';
import LineChart from '../Charts/LineChart';

const PerformanceChart = ({ analytics }) => {
  const [timeRange, setTimeRange] = useState('month');

  // Mock data - replace with actual API data
  const getChartData = () => {
    const dates = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8'];
    const scores = [45, 52, 48, 58, 62, 68, 72, 75];
    const movingAvg = [45, 48.5, 48.3, 50.8, 53, 56.5, 60, 62.3];
    return { dates, scores, movingAvg };
  };

  const { dates, scores, movingAvg } = getChartData();

  const chartData = [
    {
      label: 'Actual Score',
      values: scores,
      borderColor: '#4a90e2',
      backgroundColor: 'rgba(74, 144, 226, 0.1)'
    },
    {
      label: 'Moving Average',
      values: movingAvg,
      borderColor: '#f39c12',
      backgroundColor: 'transparent',
      borderDash: [5, 5]
    }
  ];

  const getTrendAnalysis = () => {
    const lastScore = scores[scores.length - 1];
    const firstScore = scores[0];
    const improvement = lastScore - firstScore;
    if (improvement > 5) return { text: 'Improving', color: '#27ae60', icon: 'trending-up' };
    if (improvement < -5) return { text: 'Declining', color: '#e74c3c', icon: 'trending-down' };
    return { text: 'Stable', color: '#f39c12', icon: 'trending-flat' };
  };

  const trend = getTrendAnalysis();

  return (
    <div className="performance-chart">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Performance Trend</h3>
          <div className="trend-indicator">
            <i className={`fas fa-${trend.icon}`} style={{ color: trend.color }}></i>
            <span style={{ color: trend.color }}>{trend.text}</span>
            <span className="trend-value">+{scores[scores.length - 1] - scores[0]} pts</span>
          </div>
        </div>
        <div className="chart-actions">
          {['week', 'month', 'all'].map(option => (
            <button key={option} className={`chart-action-btn ${timeRange === option ? 'active' : ''}`} onClick={() => setTimeRange(option)}>
              {option === 'week' ? 'Week' : option === 'month' ? 'Month' : 'All'}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-body">
        <LineChart data={chartData} labels={dates} yLabel="Score (%)" height={300} />
      </div>
    </div>
  );
};

export default PerformanceChart;