import { Component } from 'react';
import ProSeLegalDB from "./prose_legal_db.jsx";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 p-8 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
            <h1 className="text-2xl font-bold text-red-800 mb-4">⚠️ Application Error</h1>
            <pre className="text-sm text-red-600 bg-red-50 p-4 rounded overflow-auto mb-4">
              {this.state.error?.toString()}
            </pre>
            <p className="text-slate-700">Check the browser console (F12) for more details.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProSeLegalDB />
    </ErrorBoundary>
  );
}
