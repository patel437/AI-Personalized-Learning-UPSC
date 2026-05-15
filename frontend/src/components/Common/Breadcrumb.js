/**
 * Breadcrumb Component
 * Shows navigation path for current page
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // Don't show breadcrumb on dashboard home
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  // Get display name for path
  const getDisplayName = (path) => {
    const names = {
      'dashboard': 'Dashboard',
      'recommendations': 'Recommendations',
      'analytics': 'Analytics',
      'mock-tests': 'Mock Tests',
      'study-logs': 'Study Logs',
      'profile': 'Profile',
      'settings': 'Settings',
      'admin': 'Admin',
      'students': 'Students'
    };
    return names[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="breadcrumb">
      <div className="breadcrumb-container">
        <Link to="/dashboard" className="breadcrumb-item">
          <i className="fas fa-home"></i>
          <span>Home</span>
        </Link>
        
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          return (
            <React.Fragment key={name}>
              <span className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </span>
              {isLast ? (
                <span className="breadcrumb-item active">
                  {getDisplayName(name)}
                </span>
              ) : (
                <Link to={routeTo} className="breadcrumb-item">
                  {getDisplayName(name)}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumb;