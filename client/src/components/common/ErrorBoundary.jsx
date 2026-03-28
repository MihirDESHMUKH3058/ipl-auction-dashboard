import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#000a2a] flex flex-col items-center justify-center p-8 text-center text-white font-body selection:bg-error selection:text-white">
          <div className="w-full max-w-2xl bg-surface-container rounded-3xl border border-error/50 shadow-[0_0_40px_rgba(255,0,0,0.2)] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-error/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            
            <div className="flex justify-center mb-8 relative z-10">
              <div className="w-24 h-24 rounded-full bg-error/10 border border-error/20 flex items-center justify-center animate-pulse">
                <span className="material-symbols-outlined text-error text-5xl">warning</span>
              </div>
            </div>
            
            <h1 className="text-4xl font-headline font-black uppercase text-error tracking-tighter italic mb-4 relative z-10">Critical System Error</h1>
            
            <p className="text-slate-400 font-label tracking-widest uppercase text-xs mb-8 relative z-10">The interface node encountered an unexpected anomaly.</p>
            
            <div className="bg-black/50 p-6 rounded-xl border border-white/5 text-left overflow-x-auto mb-8 relative z-10">
              <p className="text-error font-mono text-sm mb-2 font-bold">{this.state.error && this.state.error.toString()}</p>
              <pre className="text-slate-500 font-mono text-[10px] leading-tight">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>
            
            <button
              onClick={() => window.location.href = '/'}
              className="bg-error text-white font-headline font-black uppercase tracking-widest text-sm px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(255,0,0,0.3)] hover:scale-105 transition-transform"
            >
              Reboot Interface
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
