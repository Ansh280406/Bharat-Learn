import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';

function ErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div role="alert" style={{ padding: '20px', color: 'white', background: 'var(--danger)', borderRadius: '12px', margin: '20px', textAlign: 'center' }}>
      <h2>Something went wrong in the AR viewer:</h2>
      <pre style={{ margin: '10px 0', fontSize: '12px', whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      <button onClick={resetErrorBoundary} className="glass-btn" style={{ background: '#fff', color: '#000', padding: '8px 16px', borderRadius: '8px' }}>
        Try again
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthProvider>
        <Toaster 
          position="top-center" 
          toastOptions={{ style: { background: '#13152d', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} 
        />
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
);
