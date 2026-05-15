/**
 * Loader Component
 * Loading spinner for async operations
 */

import React from 'react';
import { ThreeDots } from 'react-loader-spinner';

const Loader = ({ fullScreen = false, size = 'medium', text = 'Loading...' }) => {
  // Size mapping
  const sizeMap = {
    small: { width: 30, height: 30 },
    medium: { width: 50, height: 50 },
    large: { width: 80, height: 80 }
  };
  
  const { width, height } = sizeMap[size] || sizeMap.medium;
  
  const loaderContent = (
    <div className="loader-container">
      <ThreeDots
        height={height}
        width={width}
        color="#4a90e2"
        ariaLabel="loading"
        visible={true}
      />
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
  
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        {loaderContent}
      </div>
    );
  }
  
  return loaderContent;
};

// Skeleton loader for cards
export const CardSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header"></div>
      <div className="skeleton-body">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  );
};

// Skeleton loader for charts
export const ChartSkeleton = () => {
  return (
    <div className="skeleton-chart">
      <div className="skeleton-header"></div>
      <div className="skeleton-chart-body"></div>
    </div>
  );
};

// Skeleton loader for table
export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
      {[...Array(rows)].map((_, index) => (
        <div key={index} className="skeleton-table-row">
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
        </div>
      ))}
    </div>
  );
};

export default Loader;