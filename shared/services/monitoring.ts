/**
 * Monitoring Service — Sentry wrapper
 *
 * Usage:
 *   import { monitoring } from '@ksebe/shared';
 *   monitoring.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
 *   monitoring.captureError(error);
 *   monitoring.setUser({ id: user.id, email: user.email });
 *
 * Add to package.json:
 *   "@sentry/react": "^8"
 *   "@sentry/vite-plugin": "^2" (devDependency)
 *
 * Required env var:
 *   VITE_SENTRY_DSN=https://xxx@oXXXXXX.ingest.sentry.io/XXXXX
 */

type SentryUser = { id?: string; email?: string; username?: string };

// Lazy-load Sentry so the bundle is not affected if DSN is not configured
// We use dynamic import rather than a static import to avoid requiring
// @sentry/react as an installed package for tests / non-production builds.

let _sentry: typeof import('@sentry/react') | null = null;

async function getSentry(): Promise<typeof import('@sentry/react') | null> {
  if (_sentry) return _sentry;
  try {
    // Dynamic import — safe to use even if @sentry/react is not installed:
    // if the package is missing the Promise will reject and we silently disable monitoring.
    _sentry = await import('@sentry/react');
    return _sentry;
  } catch {
    return null;
  }
}

export interface MonitoringInitOptions {
  dsn?: string;
  environment?: string;
  release?: string;
  /** Sample rate 0-1 for performance tracing (default: 0.1 in prod) */
  tracesSampleRate?: number;
}

const monitoring = {
  /**
   * Initialize Sentry. Call once at app startup before rendering React.
   * No-op if DSN is not provided.
   */
  async init(options: MonitoringInitOptions = {}): Promise<void> {
    const { dsn, environment = 'production', release, tracesSampleRate } = options;
    if (!dsn) return; // Monitoring disabled — no DSN configured

    const Sentry = await getSentry();
    if (!Sentry) return;

    Sentry.init({
      dsn,
      environment,
      release,
      integrations: [Sentry.browserTracingIntegration()],
      tracesSampleRate: tracesSampleRate ?? (environment === 'production' ? 0.1 : 1.0),
      // Do not send PII by default
      sendDefaultPii: false,
      // Ignore common non-actionable errors
      ignoreErrors: [
        'Network Error',
        'NetworkError when attempting to fetch resource.',
        'The network connection was lost.',
        'Load failed',
        // Capacitor / native layer noise
        'Plugin not available',
        'ResizeObserver loop limit exceeded',
      ],
    });
  },

  /** Capture an exception and send to Sentry */
  async captureError(error: unknown, context?: Record<string, unknown>): Promise<void> {
    // Always log to console regardless of Sentry
    console.error('[monitoring]', error, context);
    const Sentry = await getSentry();
    if (!Sentry) return;
    if (context) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Sentry.withScope((scope: any) => {
        scope.setExtras(context);
        Sentry.captureException(error);
      });
    } else {
      Sentry.captureException(error);
    }
  },

  /** Set the current authenticated user on Sentry scope */
  async setUser(user: SentryUser | null): Promise<void> {
    const Sentry = await getSentry();
    if (!Sentry) return;
    Sentry.setUser(user);
  },

  /** Record a custom breadcrumb event */
  async addBreadcrumb(message: string, data?: Record<string, unknown>): Promise<void> {
    const Sentry = await getSentry();
    if (!Sentry) return;
    Sentry.addBreadcrumb({ message, data, level: 'info' });
  },
};

export { monitoring };
