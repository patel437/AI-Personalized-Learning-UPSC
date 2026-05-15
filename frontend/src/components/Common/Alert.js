/**
 * Alert Component
 * Reusable alert messages for success, error, warning, info
 */

import React, { useState, useEffect } from 'react';

const Alert = ({ type, message, dismissible = true, autoClose = false, autoCloseTime = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);

  // Auto close functionality
  useEffect(() => {
    if (autoClose && visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseTime);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseTime, visible]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible) return null;

  // Get icon based on type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <i className="fas fa-check-circle"></i>;
      case 'error':
        return <i className="fas fa-exclamation-circle"></i>;
      case 'warning':
        return <i className="fas fa-exclamation-triangle"></i>;
      case 'info':
        return <i className="fas fa-info-circle"></i>;
      default:
        return <i className="fas fa-bell"></i>;
    }
  };

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-icon">
        {getIcon()}
      </div>
      <div className="alert-content">
        {message}
      </div>
      {dismissible && (
        <button className="alert-close" onClick={handleClose}>
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

// Success Alert
export const SuccessAlert = ({ message, ...props }) => (
  <Alert type="success" message={message} {...props} />
);

// Error Alert
export const ErrorAlert = ({ message, ...props }) => (
  <Alert type="error" message={message} {...props} />
);

// Warning Alert
export const WarningAlert = ({ message, ...props }) => (
  <Alert type="warning" message={message} {...props} />
);

// Info Alert
export const InfoAlert = ({ message, ...props }) => (
  <Alert type="info" message={message} {...props} />
);

export default Alert;