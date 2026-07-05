import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css';
import App from './App.jsx';

// Catch early bootstrap errors
window.addEventListener('error', (event) => {
  console.log('Bootstrap Error Caught:', event.error);
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 24px; color: #ef4444; background: #fee2e2; border: 1px solid #fca5a5; margin: 20px; border-radius: 8px; font-family: sans-serif;">
        <h2 style="margin-top: 0;">Bootstrap / Render Error:</h2>
        <p style="font-weight: bold;">${event.message}</p>
        <pre style="background: rgba(0,0,0,0.05); padding: 12px; border-radius: 4px; overflow: auto; font-size: 13px;">${event.error?.stack || 'No stack trace available'}</pre>
      </div>
    `;
  }
});

// React Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', color: '#ef4444', background: '#fee2e2', border: '1px solid #fca5a5', margin: '20px', borderRadius: '8px', fontFamily: 'sans-serif', textAlign: 'left' }}>
          <h2 style={{ marginTop: 0 }}>React Render Error:</h2>
          <p style={{ fontWeight: 'bold' }}>{this.state.error?.message || this.state.error?.toString()}</p>
          <pre style={{ background: 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '4px', overflow: 'auto', fontSize: '13px' }}>
            {this.state.error?.stack || 'No stack trace available'}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
