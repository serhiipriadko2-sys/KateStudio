import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import type { ErrorInfo } from 'react';
import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const sentryEnabled = Boolean(sentryDsn);

const logWebVital = (metric: Metric) => {
  const payload = {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    navigationType: metric.navigationType,
  };

  console.info('[WebVitals]', payload);

  if (sentryEnabled) {
    Sentry.captureMessage(`WebVital:${metric.name}`, {
      level: 'info',
      tags: {
        metric: metric.name,
        rating: metric.rating,
      },
      extra: payload,
    });
  }
};

export const initWebVitals = () => {
  onCLS(logWebVital);
  onLCP(logWebVital);
  onINP(logWebVital);
};

export const reportError = (error: Error, errorInfo?: ErrorInfo) => {
  if (!sentryEnabled) return;

  Sentry.captureException(error, {
    extra: {
      componentStack: errorInfo?.componentStack,
    },
  });
};

export const initMonitoring = () => {
  if (sentryEnabled) {
    const tracesSampleRate = Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0.1);

    Sentry.init({
      dsn: sentryDsn,
      environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? import.meta.env.MODE,
      integrations: [new BrowserTracing()],
      tracesSampleRate: Number.isNaN(tracesSampleRate) ? 0.1 : tracesSampleRate,
    });
  }

  initWebVitals();
};
