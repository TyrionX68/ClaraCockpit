import React from 'react';

/**
 * Error Boundary Component - Phase 2.2A
 * Prevents JavaScript crashes in critical chat components
 * Provides fallback UI when errors occur
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for different component types
      const { fallbackComponent: FallbackComponent, componentName } = this.props;
      
      if (FallbackComponent) {
        return <FallbackComponent />;
      }

      // Default fallback UI
      return (
        <div className="error-boundary-fallback p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-red-500">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">
                {componentName ? `${componentName} Error` : 'Something went wrong'}
              </h3>
              <p className="text-red-600 text-sm mt-1">
                Please refresh the page or try again later.
              </p>
            </div>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3 text-xs text-red-700">
              <summary>Error Details (Development)</summary>
              <pre className="mt-2 whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Fallback components for specific areas
export const ChatInputFallback = () => (
  <div className="chat-input-fallback p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p className="text-yellow-800 text-sm">
      💬 Chat input temporarily unavailable. Please refresh the page.
    </p>
  </div>
);

export const MessageDisplayFallback = () => (
  <div className="message-display-fallback p-3 bg-blue-50 border border-blue-200 rounded-lg">
    <p className="text-blue-800 text-sm">
      📝 Message display temporarily unavailable. Please refresh the page.
    </p>
  </div>
);

export default ErrorBoundary;

