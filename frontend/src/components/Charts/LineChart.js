/**
 * Line Chart Component
 * Displays trend data over time (scores, progress, etc.)
 */

import React from 'react';
import { Line } from 'react-chartjs-2';
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

const LineChart = ({ 
  data, 
  labels, 
  title = '', 
  xLabel = '', 
  yLabel = '',
  showLegend = true,
  height = 300,
  fill = false,
  borderColor = '#4a90e2',
  backgroundColor = 'rgba(74, 144, 226, 0.1)'
}) => {
  // Default colors for multiple datasets
  const defaultColors = [
    '#4a90e2', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c'
  ];

  // Prepare chart data
  const chartData = {
    labels: labels,
    datasets: Array.isArray(data) ? data.map((dataset, index) => ({
      label: dataset.label || `Dataset ${index + 1}`,
      data: dataset.values,
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      backgroundColor: dataset.backgroundColor || (fill ? `${dataset.borderColor || defaultColors[index % defaultColors.length]}20` : 'transparent'),
      tension: 0.4,
      fill: dataset.fill !== undefined ? dataset.fill : fill,
      pointBackgroundColor: dataset.borderColor || defaultColors[index % defaultColors.length],
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2
    })) : [{
      label: title || 'Value',
      data: data,
      borderColor: borderColor,
      backgroundColor: fill ? backgroundColor : 'transparent',
      tension: 0.4,
      fill: fill,
      pointBackgroundColor: borderColor,
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2
    }]
  };

  // Chart options
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
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
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
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: !!xLabel,
          text: xLabel,
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
          display: !!yLabel,
          text: yLabel,
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
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
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

// Performance trend chart specific component
export const PerformanceTrendChart = ({ scores, dates, title = 'Performance Trend' }) => {
  return (
    <LineChart
      data={[{
        label: 'Score',
        values: scores,
        borderColor: '#4a90e2'
      }]}
      labels={dates}
      title={title}
      yLabel="Score (%)"
      xLabel="Date"
      fill={true}
      height={300}
    />
  );
};

// Comparative trend chart (multiple subjects)
export const ComparativeTrendChart = ({ subjects, title = 'Subject Comparison' }) => {
  const datasets = subjects.map(subject => ({
    label: subject.name,
    values: subject.scores,
    borderColor: subject.color
  }));

  return (
    <LineChart
      data={datasets}
      labels={subjects[0]?.dates || []}
      title={title}
      yLabel="Score (%)"
      xLabel="Date"
      showLegend={true}
      height={350}
    />
  );
};

export default LineChart;