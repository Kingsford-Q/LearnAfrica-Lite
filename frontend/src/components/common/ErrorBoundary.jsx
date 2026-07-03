import React from 'react';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
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
    // A stale chunk reference (a tab left open across a deploy, then
    // navigating into a route that lazy-loads a now-renamed file) can throw
    // here instead of through the `vite:preloadError` event main.jsx listens
    // for, depending on how the rejection propagates. Recognize it by
    // message and recover with a real reload instead of stranding the user
    // on this page — a sessionStorage flag stops a genuine repeat failure
    // from reload-looping forever.
    const isStaleChunkError = /dynamically imported module|Importing a module script failed|Loading chunk/i.test(error?.message || '');
    if (isStaleChunkError && !sessionStorage.getItem('chunkErrorReload')) {
      sessionStorage.setItem('chunkErrorReload', '1');
      window.location.reload();
      return;
    }

    this.setState({
      error,
      errorInfo
    });
    // Log error to console in development
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We encountered an unexpected error. Please try refreshing the page or going back.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="rounded-lg bg-muted p-4 text-left">
                <p className="text-xs font-mono text-destructive break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                Go Home
              </Button>
              <Button 
                onClick={this.handleReset}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
