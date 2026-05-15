/**
 * Radar Chart Component
 * Displays multivariate data (subject performance comparison)
 */

import React from 'react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const RadarChart = ({ 
  data, 
  labels, 
  title = '', 
  showLegend = true,
  height = 300,
  fill = true
}) => {
  // Default colors
  const defaultColors = [
    { border: '#4a90e2', background: 'rgba(74, 144, 226, 0.2)' },
    { border: '#e74c3c', background: 'rgba(231, 76, 60, 0.2)' },
    { border: '#27ae60', background: 'rgba(39, 174, 96, 0.2)' },
    { border: '#f39c12', background: 'rgba(243, 156, 18, 0.2)' }
  ];

  // Prepare chart data
  const chartData = {
    labels: labels,
    datasets: Array.isArray(data) ? data.map((dataset, index) => ({
      label: dataset.label || `Dataset ${index + 1}`,
      data: dataset.values,
      borderColor: dataset.borderColor || defaultColors[index % defaultColors.length].border,
      backgroundColor: dataset.backgroundColor || defaultColors[index % defaultColors.length].background,
      borderWidth: 2,
      pointBackgroundColor: dataset.borderColor || defaultColors[index % defaultColors.length].border,
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: dataset.fill !== undefined ? dataset.fill : fill
    })) : [{
      label: title || 'Value',
      data: data,
      borderColor: defaultColors[0].border,
      backgroundColor: defaultColors[0].background,
      borderWidth: 2,
      pointBackgroundColor: defaultColors[0].border,
      pointBorderColor: '#fff',
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: fill
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13
        },
        bodyFont: {
          size: 12
        }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent'
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <Radar data={chartData} options={options} />
    </div>
  );
};

// Subject performance radar chart
export const SubjectPerformanceRadar = ({ scores, title = 'Subject Performance' }) => {
  const subjects = Object.keys(scores);
  const values = Object.values(scores);
  
  return (
    <RadarChart
      data={[{
        label: 'Current Performance',
        values: values,
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.2)'
      }]}
      labels={subjects}
      title={title}
      height={350}
    />
  );
};

// Comparative radar chart (e.g., current vs target)
export const ComparativeRadarChart = ({ current, target, subjects, title = 'Current vs Target Performance' }) => {
  return (
    <RadarChart
      data={[
        {
          label: 'Current Score',
          values: current,
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.2)'
        },
        {
          label: 'Target Score',
          values: target,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.2)'
        }
      ]}
      labels={subjects}
      title={title}
      height={350}
    />
  );
};

export default RadarChart;