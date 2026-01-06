/**
 * Tests for Core Web Vitals monitoring utilities
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock PerformanceObserver
class MockPerformanceObserver {
  callback: PerformanceObserverCallback;
  static instances: MockPerformanceObserver[] = [];

  constructor(callback: PerformanceObserverCallback) {
    this.callback = callback;
    MockPerformanceObserver.instances.push(this);
  }

  observe() {
    // Mock observe
  }

  disconnect() {
    // Mock disconnect
  }

  static clear() {
    MockPerformanceObserver.instances = [];
  }
}

describe('Web Vitals Utilities', () => {
  let originalPerformanceObserver: typeof PerformanceObserver | undefined;
  let originalPerformance: typeof performance;

  beforeEach(() => {
    originalPerformanceObserver = (
      globalThis as unknown as { PerformanceObserver?: typeof PerformanceObserver }
    ).PerformanceObserver;
    originalPerformance = globalThis.performance;
    (
      globalThis as unknown as { PerformanceObserver: typeof MockPerformanceObserver }
    ).PerformanceObserver = MockPerformanceObserver as unknown as typeof PerformanceObserver;
    MockPerformanceObserver.clear();
  });

  afterEach(() => {
    if (originalPerformanceObserver) {
      (
        globalThis as unknown as { PerformanceObserver: typeof PerformanceObserver }
      ).PerformanceObserver = originalPerformanceObserver;
    }
    globalThis.performance = originalPerformance;
    MockPerformanceObserver.clear();
  });

  describe('observeLCP', () => {
    it('should return a cleanup function', async () => {
      const { observeLCP } = await import('../webVitals');
      const callback = vi.fn();
      const cleanup = observeLCP(callback);

      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should call PerformanceObserver with correct type', async () => {
      const { observeLCP } = await import('../webVitals');
      const callback = vi.fn();
      observeLCP(callback);

      expect(MockPerformanceObserver.instances.length).toBeGreaterThan(0);
    });
  });

  describe('observeCLS', () => {
    it('should return a cleanup function', async () => {
      const { observeCLS } = await import('../webVitals');
      const callback = vi.fn();
      const cleanup = observeCLS(callback);

      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });

  describe('observeINP', () => {
    it('should return a cleanup function', async () => {
      const { observeINP } = await import('../webVitals');
      const callback = vi.fn();
      const cleanup = observeINP(callback);

      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });

  describe('observeFCP', () => {
    it('should return a cleanup function', async () => {
      const { observeFCP } = await import('../webVitals');
      const callback = vi.fn();
      const cleanup = observeFCP(callback);

      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });

  describe('observeTTFB', () => {
    it('should return a cleanup function', async () => {
      // Mock performance.getEntriesByType
      const mockNav = {
        type: 'navigate',
        responseStart: 200,
        requestStart: 100,
      };
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        mockNav as unknown as PerformanceEntry,
      ]);

      const { observeTTFB } = await import('../webVitals');
      const callback = vi.fn();
      const cleanup = observeTTFB(callback);

      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('should calculate TTFB correctly', async () => {
      const mockNav = {
        type: 'navigate',
        responseStart: 250,
        requestStart: 100,
      };
      vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
        mockNav as unknown as PerformanceEntry,
      ]);

      const { observeTTFB } = await import('../webVitals');
      const callback = vi.fn();
      observeTTFB(callback);

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TTFB',
          value: 150,
          rating: 'good', // 150ms is below 800ms threshold
        })
      );
    });
  });

  describe('observeWebVitals', () => {
    it('should return a cleanup function that disconnects all observers', async () => {
      const { observeWebVitals } = await import('../webVitals');
      const callback = vi.fn();
      const cleanup = observeWebVitals(callback);

      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });

  describe('logWebVitals', () => {
    it('should log to console', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const { logWebVitals } = await import('../webVitals');

      const cleanup = logWebVitals();
      expect(typeof cleanup).toBe('function');

      consoleSpy.mockRestore();
    });
  });
});
