import { monitoring } from '@ksebe/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { initNative, nativeReady } from './native';

// Initialize monitoring before React renders (no-op if VITE_SENTRY_DSN is not set)
void monitoring.init({
  dsn: import.meta.env.VITE_SENTRY_DSN as string | undefined,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION as string | undefined,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// ── 1. Initialize native wrapper synchronously before React renders ─────────
// Applies platform CSS classes and configures keyboard / lifecycle listeners.
initNative();

// ── 2. Mount React app ──────────────────────────────────────────────────────
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// ── 3. Hide native splash screen after first paint ─────────────────────────
// requestAnimationFrame ensures at least one frame has been painted.
requestAnimationFrame(() => {
  void nativeReady();
});
