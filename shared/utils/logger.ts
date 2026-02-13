/**
 * K Sebe Yoga Studio - Logger Utility
 *
 * A simple, structured logging utility that can be easily extended
 * to integrate with external logging services (e.g., Sentry, LogRocket)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = import.meta.env?.DEV ?? false;
    this.isProduction = import.meta.env?.PROD ?? false;
  }

  /**
   * Format log message with timestamp and context
   */
  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    // eslint-disable-next-line no-console
    console.info(this.formatMessage('info', message, context));
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorContext =
      error instanceof Error
        ? { ...context, error: error.message, stack: error.stack }
        : { ...context, error };

    console.error(this.formatMessage('error', message, errorContext));

    // In production, this is where you'd send to external service
    // Example: Sentry.captureException(error, { contexts: { custom: context } });
  }

  /**
   * Group related logs (useful for debugging)
   */
  group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line no-console
      console.group(label);
      callback();
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  /**
   * Measure execution time of a function
   */
  async time<T>(label: string, fn: () => T | Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`${label} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${label} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel, LogContext };
