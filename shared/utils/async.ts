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

/**
 * Safely execute an async function with error handling
 *
 * @param fn - Async function to execute
 * @param context - Optional context for logging
 * @returns Result object with success/error status
 *
 * @example
 * ```typescript
 * import { logger } from '@ksebe/shared';
 *
 * const result = await safeAsync(
 *   () => fetchUserData(userId),
 *   { userId, operation: 'fetchUser' }
 * );
 *
 * if (result.success) {
 *   logger.info('User data fetched', { data: result.data });
 * } else {
 *   logger.error('Failed to fetch user data', result.error);
 * }
 * ```
 */
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

/**
 * Retry an async function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise that resolves to the function result
 *
 * @example
 * ```typescript
 * const data = await retryAsync(
 *   () => fetchData(),
 *   { maxRetries: 3, delayMs: 1000 }
 * );
 * ```
 */
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

/**
 * Execute multiple async operations in parallel with error handling
 *
 * @param operations - Array of async operations
 * @returns Array of results (success or error for each operation)
 *
 * @example
 * ```typescript
 * import { logger } from '@ksebe/shared';
 *
 * const results = await parallelAsync([
 *   () => fetchUser(1),
 *   () => fetchUser(2),
 *   () => fetchUser(3),
 * ]);
 *
 * results.forEach((result, i) => {
 *   if (result.success) {
 *     logger.info(`User ${i} fetched`, { data: result.data });
 *   } else {
 *     logger.error(`User ${i} failed`, result.error);
 *   }
 * });
 * ```
 */
export async function parallelAsync<T>(
  operations: Array<() => Promise<T>>
): Promise<Array<AsyncResult<T>>> {
  const promises = operations.map((op) => safeAsync(op));
  return await Promise.all(promises);
}

/**
 * Execute async operations in batches to avoid overwhelming the system
 *
 * @param operations - Array of async operations
 * @param batchSize - Number of operations to run in parallel
 * @returns Array of results
 *
 * @example
 * ```typescript
 * const operations = users.map(user => () => processUser(user));
 * const results = await batchAsync(operations, 5); // Process 5 at a time
 * ```
 */
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

/**
 * Create a debounced async function
 *
 * @param fn - Async function to debounce
 * @param delayMs - Debounce delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounceAsync(
 *   (query: string) => searchAPI(query),
 *   300
 * );
 *
 * // Only the last call within 300ms will execute
 * debouncedSearch('hello');
 * debouncedSearch('hello world'); // This one will execute
 * ```
 */
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let resolvePromise: ((value: ReturnType<T>) => void) | null = null;
  let rejectPromise: ((reason: unknown) => void) | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      resolvePromise = resolve;
      rejectPromise = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolvePromise?.(
            result as any /* eslint-disable-line @typescript-eslint/no-explicit-any */
          );
        } catch (error) {
          rejectPromise?.(error);
        }
      }, delayMs);
    });
  };
}

/**
 * Create a throttled async function
 *
 * @param fn - Async function to throttle
 * @param delayMs - Throttle delay in milliseconds
 * @returns Throttled function
 *
 * @example
 * ```typescript
 * const throttledSave = throttleAsync(
 *   (data: FormData) => saveToAPI(data),
 *   1000
 * );
 *
 * // First call executes immediately, subsequent calls wait 1s
 * throttledSave(data1);
 * throttledSave(data2); // Waits 1s
 * ```
 */
export function throttleAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastCall = 0;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const now = Date.now();

    if (now - lastCall >= delayMs) {
      lastCall = now;
      return (await fn(...args)) as ReturnType<T>;
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve) => {
        setTimeout(
          async () => {
            lastCall = Date.now();
            const result = await fn(...args);
            pendingPromise = null;
            resolve(result as any /* eslint-disable-line @typescript-eslint/no-explicit-any */);
          },
          delayMs - (now - lastCall)
        );
      });
    }

    return await pendingPromise;
  };
}
