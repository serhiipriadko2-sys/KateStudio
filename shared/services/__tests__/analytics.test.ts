import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analytics } from '../analytics';
import { supabase } from '../supabase';

// Mock dependencies
vi.mock('../supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

vi.mock('../utils/webVitals', () => ({
  reportWebVitals: vi.fn(),
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: { pathname: '/test', search: '?q=1' },
      writable: true,
    });
  });

  it('should send page view event', () => {
    analytics.pageView('/home');
    expect(supabase.from).toHaveBeenCalledWith('analytics_events');
  });

  it('should track custom event', () => {
    analytics.track('booking_click', { plan: 'premium' });
    expect(supabase.from).toHaveBeenCalledWith('analytics_events');
  });
});
