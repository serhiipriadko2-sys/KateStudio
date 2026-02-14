/**
 * K Sebe Yoga Studio - Async Utilities
 *
 * Helper utilities for handling async operations with proper error handling and logging
 */

import { logger } from './logger';

/**
 * Result type for async operations (Either/Result pattern)
 */
export type AsyncResult<T, E = Error> = { success: true; data: T } | { success: false; error: E };

export async function safeAsync<T>(
  fn: () => Promise<T>,
  context?: Record<string, unknown>
): Promise<AsyncResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    logger.error('Async operation failed', error, context);
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delayMs = 1000, backoffMultiplier = 2, onRetry } = options;

  let lastError: Error | unknown;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        logger.error('All retry attempts failed', error, { maxRetries });
        break;
      }

      const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
      logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms`, {
        attempt,
        maxRetries,
        delay,
      });

      onRetry?.(attempt, error instanceof Error ? error : new Error(String(error)));

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export async function parallelAsync<T>(
  operations: Array<() => Promise<T>>
): Promise<Array<AsyncResult<T>>> {
  const promises = operations.map((op) => safeAsync(op));
  return await Promise.all(promises);
}

export async function batchAsync<T>(
  operations: Array<() => Promise<T>>,
  batchSize: number
): Promise<Array<AsyncResult<T>>> {
  const results: Array<AsyncResult<T>> = [];

  for (let i = 0; i < operations.length; i += batchSize) {
    const batch = operations.slice(i, i + batchSize);
    logger.debug(`Processing batch ${i / batchSize + 1}`, {
      batchSize,
      remaining: operations.length - i,
    });
    const batchResults = await parallelAsync(batch);
    results.push(...batchResults);
  }

  return results;
}

export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => ReturnType<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let resolvePromise: ((value: unknown) => void) | null = null;
  let rejectPromise: ((reason: unknown) => void) | null = null;

  return (...args: Parameters<T>): ReturnType<T> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      resolvePromise = resolve;
      rejectPromise = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolvePromise?.(result);
        } catch (error) {
          rejectPromise?.(error);
        }
      }, delayMs);
    }) as ReturnType<T>;
  };
}

export function throttleAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => ReturnType<T> {
  let lastCall = 0;
  let pendingPromise: ReturnType<T> | null = null;

  return (async (...args: Parameters<T>): Promise<unknown> => {
    const now = Date.now();

    if (now - lastCall >= delayMs) {
      lastCall = now;
      return await fn(...args);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve) => {
        setTimeout(
          async () => {
            lastCall = Date.now();
            const result = await fn(...args);
            pendingPromise = null;
            resolve(result);
          },
          delayMs - (now - lastCall)
        );
      }) as ReturnType<T>;
    }

    return await pendingPromise;
  }) as unknown as (...args: Parameters<T>) => ReturnType<T>;
}
