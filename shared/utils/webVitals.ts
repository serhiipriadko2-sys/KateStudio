/**
 * K Sebe Yoga Studio - Core Web Vitals Monitoring
 * Collects LCP, INP, CLS metrics for performance monitoring
 *
 * Based on web-vitals library patterns but simplified for our use case
 * @see https://web.dev/articles/vitals
 */

/**
 * Represents a web performance metric measurement
 */
export type WebVitalMetric = {
  /** Metric name (LCP, INP, CLS, FCP, TTFB) */
  name: 'LCP' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
  /** Current metric value in milliseconds (or unitless for CLS) */
  value: number;
  /** Quality rating based on Google's thresholds */
  rating: 'good' | 'needs-improvement' | 'poor';
  /** Change from previous measurement */
  delta: number;
  /** Unique identifier for this measurement */
  id: string;
  /** How the user navigated to the page (navigate, reload, back_forward, prerender) */
  navigationType: string;
};

type ReportCallback = (metric: WebVitalMetric) => void;

// Thresholds based on Google's Core Web Vitals recommendations (in ms)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  INP: { good: 200, poor: 500 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

// CLS session window constants (see https://web.dev/articles/cls)
/** Gap between layout shifts to start a new session (1 second) */
const CLS_SESSION_GAP_MS = 1000;
/** Maximum session duration before starting a new one (5 seconds) */
const CLS_MAX_SESSION_DURATION_MS = 5000;

/** Minimum event duration to consider for INP measurement (40ms) */
const INP_DURATION_THRESHOLD_MS = 40;

function generateId(): string {
  return `v${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
}

function getRating(
  name: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

function getNavigationType(): string {
  if (typeof window === 'undefined') return 'unknown';
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  return nav?.type || 'unknown';
}

/**
 * Observe Largest Contentful Paint (LCP)
 * Measures loading performance - how quickly the largest content element appears
 */
export function observeLCP(callback: ReportCallback): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  let lastValue = 0;
  const id = generateId();

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length === 0) return;

      const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
      const value = lastEntry.startTime;
      callback({
        name: 'LCP',
        value,
        delta: value - lastValue,
        rating: getRating('LCP', value),
        id,
        navigationType: getNavigationType(),
      });
      lastValue = value;
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });

    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * Observe Interaction to Next Paint (INP)
 * Measures responsiveness - how quickly the page responds to user interactions
 */
export function observeINP(callback: ReportCallback): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  let maxDuration = 0;
  const id = generateId();

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries() as (PerformanceEntry & { duration: number })[];
      for (const entry of entries) {
        if (entry.duration > maxDuration) {
          const delta = entry.duration - maxDuration;
          maxDuration = entry.duration;
          callback({
            name: 'INP',
            value: maxDuration,
            delta,
            rating: getRating('INP', maxDuration),
            id,
            navigationType: getNavigationType(),
          });
        }
      }
    });

    // durationThreshold filters out interactions shorter than this value
    observer.observe(
      {
        type: 'event',
        buffered: true,
        durationThreshold: INP_DURATION_THRESHOLD_MS,
      } as any /* eslint-disable-line @typescript-eslint/no-explicit-any -- durationThreshold is a valid Chrome-only PerformanceObserver option not yet in the TypeScript lib.dom types */
    );

    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * Observe Cumulative Layout Shift (CLS)
 * Measures visual stability - how much the layout shifts unexpectedly
 */
export function observeCLS(callback: ReportCallback): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  let clsValue = 0;
  let sessionValue = 0;
  let sessionEntries: PerformanceEntry[] = [];
  const id = generateId();

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries() as (PerformanceEntry & {
        hadRecentInput: boolean;
        value: number;
      })[];

      for (const entry of entries) {
        // Only count shifts without recent user input
        if (!entry.hadRecentInput) {
          const firstEntry = sessionEntries[0] as
            | (PerformanceEntry & { startTime: number })
            | undefined;
          const lastEntry = sessionEntries[sessionEntries.length - 1] as
            | (PerformanceEntry & { startTime: number })
            | undefined;

          // Start new session if gap exceeds threshold or total duration exceeds max
          const gapFromLast = entry.startTime - (lastEntry?.startTime || 0);
          const durationFromFirst = entry.startTime - (firstEntry?.startTime || 0);
          if (
            sessionValue &&
            (gapFromLast > CLS_SESSION_GAP_MS || durationFromFirst > CLS_MAX_SESSION_DURATION_MS)
          ) {
            clsValue = Math.max(clsValue, sessionValue);
            sessionValue = 0;
            sessionEntries = [];
          }

          sessionEntries.push(entry);
          sessionValue += entry.value;

          const totalValue = Math.max(clsValue, sessionValue);
          callback({
            name: 'CLS',
            value: totalValue,
            delta: entry.value,
            rating: getRating('CLS', totalValue),
            id,
            navigationType: getNavigationType(),
          });
        }
      }
    });

    observer.observe({ type: 'layout-shift', buffered: true });

    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * Observe First Contentful Paint (FCP)
 * Measures when the first content is rendered
 */
export function observeFCP(callback: ReportCallback): () => void {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return () => {};
  }

  const id = generateId();

  try {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const fcpEntry = entries.find((e) => e.name === 'first-contentful-paint') as
        | (PerformanceEntry & { startTime: number })
        | undefined;
      if (fcpEntry) {
        callback({
          name: 'FCP',
          value: fcpEntry.startTime,
          delta: fcpEntry.startTime,
          rating: getRating('FCP', fcpEntry.startTime),
          id,
          navigationType: getNavigationType(),
        });
        observer.disconnect();
      }
    });

    observer.observe({ type: 'paint', buffered: true });

    return () => observer.disconnect();
  } catch {
    return () => {};
  }
}

/**
 * Observe Time to First Byte (TTFB)
 * Measures server response time
 */
export function observeTTFB(callback: ReportCallback): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const id = generateId();

  try {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (nav) {
      const value = nav.responseStart - nav.requestStart;
      callback({
        name: 'TTFB',
        value,
        delta: value,
        rating: getRating('TTFB', value),
        id,
        navigationType: nav.type,
      });
    }
    return () => {};
  } catch {
    return () => {};
  }
}

/**
 * Convenience function to observe all Core Web Vitals
 */
export function observeWebVitals(callback: ReportCallback): () => void {
  const cleanups = [
    observeLCP(callback),
    observeINP(callback),
    observeCLS(callback),
    observeFCP(callback),
    observeTTFB(callback),
  ];

  return () => {
    cleanups.forEach((cleanup) => cleanup());
  };
}

/**
 * Log metrics to console in development
 */
export function logWebVitals(): () => void {
  return observeWebVitals((metric) => {
    const emoji =
      metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
    console.warn(
      `${emoji} [Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`
    );
  });
}

/**
 * Send metrics to analytics endpoint
 */
export function reportWebVitals(endpoint: string, callback?: ReportCallback): () => void {
  return observeWebVitals((metric) => {
    callback?.(metric);

    // Use sendBeacon for reliable delivery
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        id: metric.id,
        timestamp: Date.now(),
        url: window.location.href,
        navigationType: metric.navigationType,
      });
      navigator.sendBeacon(endpoint, body);
    }
  });
}
