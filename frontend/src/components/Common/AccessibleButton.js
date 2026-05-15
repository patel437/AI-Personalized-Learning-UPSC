import React from 'react';

/**
 * Accessible Button Component
 * Adds proper ARIA attributes and keyboard support
 */
export const AccessibleButton = ({ 
  children, 
  onClick, 
  ariaLabel, 
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  type = 'button',
  ...props 
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !loading && onClick) onClick(e);
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-block' : ''}`}
      {...props}
    >
      {loading && <i className="fas fa-spinner fa-spin" aria-hidden="true"></i>}
      <span>{children}</span>
    </button>
  );
};

// Skip to content link for keyboard users
export const SkipToContent = () => (
  <a href="#main-content" className="skip-to-content">
    Skip to main content
  </a>
);