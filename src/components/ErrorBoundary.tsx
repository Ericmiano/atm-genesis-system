import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, Bug, Home } from 'lucide-react';

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo?: React.ErrorInfo; errorId?: string; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = crypto.randomUUID();
    
    // Log error to monitoring service
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      errorId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });

    return { 
      hasError: true, 
      error, 
      errorId 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Send to error tracking service (if available)
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: true,
        error_id: this.state.errorId
      });
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            errorInfo={this.state.errorInfo} 
            errorId={this.state.errorId}
            resetError={this.resetError}
          />
        );
      }

      return <DefaultErrorFallback 
        error={this.state.error!} 
        errorInfo={this.state.errorInfo} 
        errorId={this.state.errorId}
        resetError={this.resetError}
      />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
  resetError: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo, 
  errorId, 
  resetError 
}) => {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
            <Bug className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're sorry, but something unexpected happened. Our team has been notified.
          </p>
          
          {errorId && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Reference</AlertTitle>
              <AlertDescription>
                Error ID: <code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">{errorId}</code>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-3">
          <Button 
            onClick={resetError} 
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'} 
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => setShowDetails(!showDetails)} 
            className="w-full text-sm"
          >
            {showDetails ? 'Hide' : 'Show'} Technical Details
          </Button>
        </div>

        {showDetails && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Error Details:</h3>
            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2">
              <div>
                <strong>Message:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              )}
              {errorInfo && (
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-auto max-h-32">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorBoundary;
export { DefaultErrorFallback };
export type { ErrorFallbackProps };
