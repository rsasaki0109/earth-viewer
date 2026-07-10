import { Component, type ErrorInfo, type ReactNode } from 'react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional title shown above the error message. */
  title?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time failures (e.g. Cesium initialization errors) so the
 * whole tab does not go blank. Resets only via a full page reload.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Keep a breadcrumb in the console for debugging; do not rethrow.
    console.error('EarthViewer error boundary caught:', error, info.componentStack);
  }

  render(): ReactNode {
    const { error } = this.state;
    if (!error) {
      return this.props.children;
    }

    return (
      <div className="error-boundary" role="alert">
        <h1>{this.props.title ?? 'Something went wrong'}</h1>
        <p className="error-boundary__message">{error.message || 'Unknown error'}</p>
        <p className="error-boundary__hint">
          Try reloading the page. If the problem continues, check that WebGL is
          enabled and that your browser is up to date.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}
