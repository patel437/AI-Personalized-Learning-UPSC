/**
 * Trend Chart Component
 * Advanced chart with predictions and trend lines
 */

import React from 'react';
import { Line } from 'react-chartjs-2';
import LineChart from './LineChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendChart = ({ 
  actualData, 
  predictedData, 
  labels, 
  title = 'Performance Trend',
  showLegend = true,
  height = 350
}) => {
  // Prepare chart data with actual and predicted
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Actual Score',
        data: actualData,
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#4a90e2',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7,
        borderWidth: 3
      },
      {
        label: 'Predicted Trend',
        data: predictedData,
        borderColor: '#f39c12',
        backgroundColor: 'rgba(243, 156, 18, 0.05)',
        borderDash: [5, 5],
        tension: 0.4,
        fill: false,
        pointBackgroundColor: '#f39c12',
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2
      }
    ]
  };

  // Find the point where prediction starts
  const actualLength = actualData.filter(d => d !== null).length;
  
  // Add shaded area for prediction confidence (optional)
  if (predictedData.length > actualLength) {
    const confidenceUpper = predictedData.map((val, idx) => {
      if (idx < actualLength) return null;
      return val * 1.1;
    });
    const confidenceLower = predictedData.map((val, idx) => {
      if (idx < actualLength) return null;
      return val * 0.9;
    });
    
    chartData.datasets.push({
      label: 'Confidence Range',
      data: confidenceUpper,
      borderColor: 'rgba(243, 156, 18, 0.2)',
      backgroundColor: 'rgba(243, 156, 18, 0.1)',
      fill: false,
      pointRadius: 0,
      borderWidth: 0
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          font: {
            size: 12
          },
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y;
            if (context.dataset.label === 'Predicted Trend') {
              label += ' (estimated)';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Mock Test Number',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        title: {
          display: true,
          text: 'Score',
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        max: 200,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    elements: {
      line: {
        borderJoin: 'round'
      }
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

// Mock test trend chart with predictions
export const MockTestTrendChart = ({ actualScores, predictedScores, testNumbers, title = 'Mock Test Performance Trend' }) => {
  // Create labels for all tests (actual + predicted)
  const allLabels = [...testNumbers];
  for (let i = testNumbers.length + 1; i <= testNumbers.length + predictedScores.length; i++) {
    allLabels.push(`Test ${i} (Predicted)`);
  }
  
  // Prepare actual data with nulls for predicted positions
  const actualDataWithNulls = [...actualScores];
  for (let i = 0; i < predictedScores.length; i++) {
    actualDataWithNulls.push(null);
  }
  
  // Prepare predicted data with nulls for actual positions
  const predictedDataWithNulls = new Array(actualScores.length).fill(null);
  predictedDataWithNulls.push(...predictedScores);

  return (
    <TrendChart
      actualData={actualDataWithNulls}
      predictedData={predictedDataWithNulls}
      labels={allLabels}
      title={title}
      height={350}
    />
  );
};

// Subject improvement trend chart
export const SubjectImprovementTrend = ({ subjectData, title = 'Subject-wise Improvement Trend' }) => {
  const datasets = [];
  const colors = ['#4a90e2', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6'];
  
  subjectData.forEach((subject, index) => {
    datasets.push({
      label: subject.name,
      values: subject.scores,
      borderColor: colors[index % colors.length],
      backgroundColor: 'transparent'
    });
  });

  return (
    <LineChart
      data={datasets}
      labels={subjectData[0]?.dates || []}
      title={title}
      yLabel="Score (%)"
      xLabel="Date"
      showLegend={true}
      height={350}
    />
  );
};

export default TrendChart;