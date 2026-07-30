import { Component, ReactNode } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center text-[var(--text-primary)]" style={{ background: '#050505' }}>
          <div className="double-bezel max-w-md rounded-[calc(2rem+2px)]">
        <div className="double-bezel-inner p-8 text-center">
            <FiAlertTriangle className="mx-auto mb-4 text-yellow-500" size={48} />
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-[var(--text-secondary)] mb-4 text-sm">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={this.handleReload}
              className="px-6 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
          </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
