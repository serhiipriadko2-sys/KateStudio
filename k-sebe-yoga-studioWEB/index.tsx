import { ErrorBoundary } from '@ksebe/shared';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initMonitoring, reportError } from './services/monitoring';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

initMonitoring();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary onError={reportError}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
