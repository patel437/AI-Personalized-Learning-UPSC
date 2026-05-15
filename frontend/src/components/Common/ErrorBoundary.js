import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error reporting service
    if (window.errorReporting) {
      window.errorReporting.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <div className="error-content">
            <i className="fas fa-exclamation-triangle"></i>
            <h2>Something went wrong</h2>
            <p>We apologize for the inconvenience. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary">
              Refresh Page
            </button>
            <button onClick={() => this.setState({ hasError: false })} className="btn btn-outline">
              Try to recover
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper component with notification support
export const ErrorBoundary = ({ children, fallback }) => {
  const { showError } = useNotification();
  
  const handleError = (error) => {
    showError(error.message || 'An unexpected error occurred');
  };

  return (
    <ErrorBoundaryClass fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;