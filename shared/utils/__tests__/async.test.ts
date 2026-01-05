/**
 * Tests for async utilities
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  safeAsync,
  retryAsync,
  parallelAsync,
  batchAsync,
  debounceAsync,
  throttleAsync,
} from '../async';

describe('Async Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('safeAsync', () => {
    it('should return success result for successful operation', async () => {
      const result = await safeAsync(async () => 'success');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('success');
      }
    });

    it('should return error result for failed operation', async () => {
      const result = await safeAsync(async () => {
        throw new Error('Failed');
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Failed');
      }
    });

    it('should handle non-Error throws', async () => {
      const result = await safeAsync(async () => {
        throw 'string error';
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });
  });

  describe('retryAsync', () => {
    it('should succeed on first attempt', async () => {
      const fn = vi.fn(async () => 'success');
      const result = await retryAsync(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      let attempts = 0;
      const fn = vi.fn(async () => {
        attempts++;
        if (attempts < 3) throw new Error('Not yet');
        return 'success';
      });

      const result = await retryAsync(fn, { maxRetries: 3, delayMs: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn(async () => {
        throw new Error('Always fails');
      });

      await expect(retryAsync(fn, { maxRetries: 2, delayMs: 10 })).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should call onRetry callback', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 2) throw new Error('Not yet');
        return 'success';
      };

      const onRetry = vi.fn();
      await retryAsync(fn, { maxRetries: 3, delayMs: 10, onRetry });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });
  });

  describe('parallelAsync', () => {
    it('should execute all operations in parallel', async () => {
      const operations = [async () => 'result1', async () => 'result2', async () => 'result3'];

      const results = await parallelAsync(operations);

      expect(results).toHaveLength(3);
      expect(results[0].success && results[0].data).toBe('result1');
      expect(results[1].success && results[1].data).toBe('result2');
      expect(results[2].success && results[2].data).toBe('result3');
    });

    it('should handle mixed success and failure', async () => {
      const operations = [
        async () => 'success',
        async () => {
          throw new Error('failed');
        },
        async () => 'success2',
      ];

      const results = await parallelAsync(operations);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[2].success).toBe(true);
    });
  });

  describe('batchAsync', () => {
    it('should process operations in batches', async () => {
      const operations = Array.from({ length: 10 }, (_, i) => async () => i);
      const results = await batchAsync(operations, 3);

      expect(results).toHaveLength(10);
      results.forEach((result, i) => {
        expect(result.success && result.data).toBe(i);
      });
    });
  });

  describe('debounceAsync', () => {
    it('should debounce function calls', async () => {
      const fn = vi.fn(async (x: number) => x * 2);
      const debounced = debounceAsync(fn, 50);

      // Call multiple times
      debounced(1);
      debounced(2);
      const result = await debounced(3);

      // Only the last call should execute
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(3);
      expect(result).toBe(6);
    });
  });

  describe('throttleAsync', () => {
    it('should throttle function calls', async () => {
      const fn = vi.fn(async (x: number) => x * 2);
      const throttled = throttleAsync(fn, 100);

      // First call executes immediately
      const result1 = await throttled(1);
      expect(result1).toBe(2);
      expect(fn).toHaveBeenCalledTimes(1);

      // Second call within throttle period should wait
      const result2Promise = throttled(2);

      // Wait for throttle period
      await new Promise((resolve) => setTimeout(resolve, 150));
      const result2 = await result2Promise;

      expect(result2).toBe(4);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });
});
