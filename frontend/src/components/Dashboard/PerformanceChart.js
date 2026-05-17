/**
 * PerformanceChart Component
 * Shows live performance trends over time for GS and CSAT
 */

import React, { useState } from 'react';
import LineChart from '../Charts/LineChart';

const PerformanceChart = ({ analytics }) => {
  const [timeRange, setTimeRange] = useState('month');

  // Parses database lists dynamically and converts them into 0-100% metrics
  const getChartData = () => {
    if (analytics && analytics.dates && analytics.dates.length > 0) {
      // Formats database strings to make labels scannable on smaller device views
      const dates = analytics.dates.map(d => d.substring(5, 10).replace('-', '/')); 
      
      // Converts raw scores (out of 200) to clear percentages
      const gsPercentages = analytics.gs_scores.map(score => Math.round((score / 200) * 100));
      const csatPercentages = analytics.csat_scores.map(score => Math.round((score / 200) * 100));
      
      return { dates, gsPercentages, csatPercentages, totalTests: dates.length };
    }
    
    // Fallback Mock Data structure if user has not logged any tests yet
    const dates = ['Mock 1', 'Mock 2', 'Mock 3', 'Mock 4', 'Mock 5'];
    const gsPercentages = [52, 58, 61, 65, 72];
    const csatPercentages = [48, 52, 55, 60, 66];
    return { dates, gsPercentages, csatPercentages, totalTests: 5 };
  };

  const { dates, gsPercentages, csatPercentages } = getChartData();

  const chartData = [
    {
      label: 'GS Score (%)',
      values: gsPercentages,
      borderColor: '#4a90e2',
      backgroundColor: 'rgba(74, 144, 226, 0.1)'
    },
    {
      label: 'CSAT Score (%)',
      values: csatPercentages,
      borderColor: '#27ae60',
      backgroundColor: 'rgba(39, 174, 96, 0.1)'
    }
  ];

  const getTrendAnalysis = () => {
    if (gsPercentages.length < 2) return { text: 'Initial State', color: '#f39c12', icon: 'minus' };
    const improvement = gsPercentages[gsPercentages.length - 1] - gsPercentages[0];
    if (improvement > 3) return { text: 'Improving Progress', color: '#27ae60', icon: 'trending-up' };
    if (improvement < -3) return { text: 'Score Decline', color: '#e74c3c', icon: 'trending-down' };
    return { text: 'Stable Consistency', color: '#4a90e2', icon: 'minus' };
  };

  const trend = getTrendAnalysis();
  const progressDiff = gsPercentages.length >= 2 ? gsPercentages[gsPercentages.length - 1] - gsPercentages[0] : 0;

  return (
    <div className="performance-chart">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Performance Trend Analysis</h3>
          <div className="trend-indicator">
            <i className={`fas fa-${trend.icon === 'minus' ? 'minus' : trend.icon}`} style={{ color: trend.color }}></i>
            <span style={{ color: trend.color, marginLeft: '6px', fontWeight: '600' }}>{trend.text}</span>
            {progressDiff !== 0 && (
              <span className="trend-value" style={{ marginLeft: '10px' }}>
                {progressDiff > 0 ? `+${progressDiff}` : progressDiff} percentage points
              </span>
            )}
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
        <LineChart data={chartData} labels={dates} yLabel="Score Percentage (%)" height={300} />
      </div>
    </div>
  );
};

export default PerformanceChart;