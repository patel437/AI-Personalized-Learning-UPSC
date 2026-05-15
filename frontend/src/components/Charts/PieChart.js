/**
 * Pie/Doughnut Chart Component
 * Displays proportional data (distribution, percentage breakdown)
 */

import React from 'react';
import { Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const PieChart = ({ 
  data, 
  labels, 
  title = '', 
  doughnut = false,
  showLegend = true,
  height = 300,
  colors = null,
  cutout = '50%'
}) => {
  // Default colors
  const defaultColors = [
    '#4a90e2', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c',
    '#34495e', '#e67e22', '#2ecc71', '#e84393', '#3498db', '#95a5a6'
  ];

  // Prepare chart data
  const chartData = {
    labels: labels,
    datasets: [{
      data: data,
      backgroundColor: colors || defaultColors.slice(0, data.length),
      borderColor: 'white',
      borderWidth: 2,
      hoverOffset: 10
    }]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom',
        labels: {
          font: {
            size: 11
          },
          generateLabels: (chart) => {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original(chart);
            labels.forEach(label => {
              const dataset = chart.data.datasets[0];
              const value = dataset.data[label.index];
              label.text = `${label.text}: ${value}`;
            });
            return labels;
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
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const ChartComponent = doughnut ? Doughnut : Pie;
  const doughnutOptions = doughnut ? { ...options, cutout } : options;

  return (
    <div style={{ height: `${height}px`, width: '100%' }}>
      <ChartComponent data={chartData} options={doughnutOptions} />
    </div>
  );
};

// Subject distribution pie chart
export const SubjectDistributionChart = ({ scores, title = 'Score Distribution' }) => {
  const subjects = Object.keys(scores);
  const values = Object.values(scores);
  
  return (
    <PieChart
      data={values}
      labels={subjects}
      title={title}
      doughnut={true}
      height={300}
    />
  );
};

// Category breakdown chart (e.g., weak vs strong vs average)
export const CategoryBreakdownChart = ({ categories, title = 'Performance Breakdown' }) => {
  const labels = categories.map(c => c.name);
  const values = categories.map(c => c.value);
  
  return (
    <PieChart
      data={values}
      labels={labels}
      title={title}
      doughnut={false}
      height={300}
    />
  );
};

// Study time distribution chart
export const StudyTimeDistribution = ({ timeData, title = 'Study Time Distribution' }) => {
  const labels = timeData.map(t => t.label);
  const values = timeData.map(t => t.hours);
  
  return (
    <PieChart
      data={values}
      labels={labels}
      title={title}
      doughnut={true}
      height={280}
    />
  );
};

export default PieChart;