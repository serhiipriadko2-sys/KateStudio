/**
 * Tests for Core Web Vitals monitoring utilities
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  observeLCP,
  observeINP,
  observeCLS,
  observeFCP,
  observeTTFB,
  observeWebVitals,
  logWebVitals,
  reportWebVitals,
} from '../webVitals';

describe('webVitals', () => {
  describe('when PerformanceObserver is not available', () => {
    let originalPO: typeof PerformanceObserver;

    beforeEach(() => {
      originalPO = window.PerformanceObserver;
      // @ts-expect-error - simulate missing API
      delete window.PerformanceObserver;
    });

    afterEach(() => {
      window.PerformanceObserver = originalPO;
    });

    it('observeLCP returns a no-op cleanup', () => {
      const cb = vi.fn();
      const cleanup = observeLCP(cb);
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
      expect(cb).not.toHaveBeenCalled();
    });

    it('observeINP returns a no-op cleanup', () => {
      const cb = vi.fn();
      const cleanup = observeINP(cb);
      expect(typeof cleanup).toBe('function');
      cleanup();
      expect(cb).not.toHaveBeenCalled();
    });

    it('observeCLS returns a no-op cleanup', () => {
      const cb = vi.fn();
      const cleanup = observeCLS(cb);
      expect(typeof cleanup).toBe('function');
      cleanup();
      expect(cb).not.toHaveBeenCalled();
    });

    it('observeFCP returns a no-op cleanup', () => {
      const cb = vi.fn();
      const cleanup = observeFCP(cb);
      expect(typeof cleanup).toBe('function');
      cleanup();
      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('observeTTFB', () => {
    it('returns a cleanup function without throwing', () => {
      const cb = vi.fn();
      const cleanup = observeTTFB(cb);
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });

    it('calls callback when navigation entry exists', () => {
      const cb = vi.fn();
      const mockNav = {
        requestStart: 100,
        responseStart: 250,
        type: 'navigate',
      };
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        mockNav as unknown as PerformanceEntry,
      ]);

      observeTTFB(cb);

      expect(cb).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TTFB',
          value: 150,
          delta: 150,
          navigationType: 'navigate',
          rating: expect.stringMatching(/good|needs-improvement|poor/),
        })
      );

      vi.restoreAllMocks();
    });

    it('does not call callback when no navigation entry', () => {
      const cb = vi.fn();
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([]);
      observeTTFB(cb);
      expect(cb).not.toHaveBeenCalled();
      vi.restoreAllMocks();
    });
  });

  describe('observeWebVitals', () => {
    it('returns a cleanup function that does not throw', () => {
      const cb = vi.fn();
      const cleanup = observeWebVitals(cb);
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('logWebVitals', () => {
    it('returns a cleanup function without throwing', () => {
      const cleanup = logWebVitals();
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });
  });

  describe('reportWebVitals', () => {
    it('returns a cleanup function without throwing', () => {
      const cleanup = reportWebVitals('/api/vitals');
      expect(typeof cleanup).toBe('function');
      expect(() => cleanup()).not.toThrow();
    });

    it('accepts an optional callback', () => {
      const cb = vi.fn();
      const cleanup = reportWebVitals('/api/vitals', cb);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });

  describe('getRating (via observeTTFB)', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it.each([
      [100, 'good'],
      [1200, 'needs-improvement'],
      [2000, 'poor'],
    ])('TTFB %dms → %s rating', (ttfb, expectedRating) => {
      const cb = vi.fn();
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        {
          requestStart: 0,
          responseStart: ttfb,
          type: 'navigate',
        } as unknown as PerformanceEntry,
      ]);

      observeTTFB(cb);

      expect(cb).toHaveBeenCalledWith(expect.objectContaining({ rating: expectedRating }));
    });
  });
});
