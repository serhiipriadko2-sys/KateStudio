import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { initNative, nativeReady } from './native';

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
    <AuthProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>
);

// ── 3. Hide native splash screen after first paint ─────────────────────────
// requestAnimationFrame ensures at least one frame has been painted.
requestAnimationFrame(() => {
  void nativeReady();
});
