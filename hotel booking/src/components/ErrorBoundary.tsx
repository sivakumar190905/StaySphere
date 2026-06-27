import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-center p-6 space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-3xl font-extrabold shadow-sm mx-auto">
            ⚠️
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">Something went wrong</h1>
            <p className="text-slate-500 text-xs font-bold leading-relaxed max-w-md mx-auto">
              We encountered an unexpected rendering error. Please try reloading the page or return home.
            </p>
          </div>
          <div className="flex items-center gap-3 justify-center">
            <button
              onClick={this.handleReload}
              className="bg-slate-900 hover:bg-blue-600 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-sm border-none cursor-pointer"
            >
              Reload Page
            </button>
            <button
              onClick={this.handleGoHome}
              className="bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-sm border border-slate-200 cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
