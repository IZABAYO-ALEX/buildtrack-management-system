import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    
    // Log to error tracking service
    if (window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <AlertCircle size={48} color="#ef4444" />
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <div className="error-details">
              <code>{this.state.error?.stack}</code>
            </div>
            <button onClick={this.handleRetry} className="retry-btn">
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
