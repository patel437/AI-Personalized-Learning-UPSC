/**
 * Bar Chart Component
 * Displays comparative data (subject scores, category distribution, etc.)
 */

import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ 
  data, 
  labels, 
  title = '', 
  xLabel = '', 
  yLabel = '',
  showLegend = true,
  height = 300,
  horizontal = false,
  colors = null
}) => {
  // Default colors
  const defaultColors = [
    '#4a90e2', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c',
    '#34495e', '#e67e22', '#2ecc71', '#e84393'
  ];

  // Prepare chart data
  const chartData = {
    labels: labels,
    datasets: Array.isArray(data) ? data.map((dataset, index) => ({
      label: dataset.label || `Dataset ${index + 1}`,
      data: dataset.values,
      backgroundColor: dataset.backgroundColor || (colors ? colors[index] : defaultColors[index % defaultColors.length]),
      borderColor: dataset.borderColor || (colors ? colors[index] : defaultColors[index % defaultColors.length]),
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.7,
      categoryPercentage: 0.8
    })) : [{
      label: title || 'Value',
      data: data,
      backgroundColor: colors || defaultColors[0],
      borderColor: colors || defaultColors[0],
      borderWidth: 1,
      borderRadius: 4,
      barPercentage: 0.7
    }]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? 'y' : 'x',
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
        labels: {
          font: {
            size: 12
          }
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
            label += context.parsed[horizontal ? 'x' : 'y'];
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: !!xLabel,
          text: horizontal ? yLabel : xLabel,
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        title: {
          display: !!yLabel,
          text: horizontal ? xLabel : yLabel,
          font: {
            size: 12,
            weight: 'bold'
          }
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

// Subject scores bar chart
export const SubjectScoresChart = ({ scores, title = 'Subject-wise Scores' }) => {
  const subjects = Object.keys(scores);
  const values = Object.values(scores);
  
  // Color based on score
  const getColor = (score) => {
    if (score >= 75) return '#27ae60';
    if (score >= 60) return '#4a90e2';
    if (score >= 45) return '#f39c12';
    return '#e74c3c';
  };

  const colors = values.map(score => getColor(score));

  return (
    <BarChart
      data={[{
        label: 'Score (%)',
        values: values,
        backgroundColor: colors
      }]}
      labels={subjects}
      title={title}
      yLabel="Score (%)"
      height={350}
    />
  );
};

// Comparison bar chart (e.g., current vs target)
export const ComparisonBarChart = ({ current, target, labels, title = 'Current vs Target' }) => {
  return (
    <BarChart
      data={[
        {
          label: 'Current Score',
          values: current,
          backgroundColor: '#4a90e2'
        },
        {
          label: 'Target Score',
          values: target,
          backgroundColor: '#27ae60'
        }
      ]}
      labels={labels}
      title={title}
      yLabel="Score (%)"
      showLegend={true}
      height={350}
    />
  );
};

export default BarChart;