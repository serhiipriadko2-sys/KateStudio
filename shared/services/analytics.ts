import { reportWebVitals, WebVitalMetric } from '../utils/webVitals';
import { isSupabaseConfigured, supabase } from './supabase';

/**
 * Analytics Service
 * Handles event tracking and performance monitoring
 */

declare global {
  interface Window {
    __analytics_initialized?: boolean;
  }
}

const SESSION_KEY = 'analytics_session_id';

const getSessionId = (): string => {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `sess_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

const sendEvent = async (name: string, data: Record<string, unknown> = {}) => {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from('analytics_events').insert({
      event_name: name,
      event_data: data,
      session_id: getSessionId(),
      url: window.location.pathname + window.location.search,
      user_agent: navigator.userAgent,
    });
  } catch {
    // Fail silently to avoid impacting UX
  }
};

export const analytics = {
  /**
   * Track a page view
   */
  pageView: (path: string) => {
    sendEvent('page_view', { path });
  },

  /**
   * Track a custom event (e.g., 'booking_started')
   */
  track: (name: string, properties?: Record<string, unknown>) => {
    sendEvent(name, properties);
  },

  /**
   * Initialize Web Vitals tracking
   */
  initWebVitals: () => {
    if (typeof window === 'undefined') return;

    // Only init once
    if (window.__analytics_initialized) return;
    window.__analytics_initialized = true;

    reportWebVitals('/api/analytics', (metric: WebVitalMetric) => {
      sendEvent('web_vital', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      });
    });
  },
};
