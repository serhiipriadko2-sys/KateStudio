/**
 * Tests for Logger utility
 */
/* eslint-disable no-console */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../logger';

describe('Logger', () => {
  // const _originalEnv = import.meta.env;

  beforeEach(() => {
    // Spy on console methods
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debug', () => {
    it('should log debug messages in development', () => {
      logger.debug('Test debug message');
      // Debug logs are only shown in dev mode
      expect(console.debug).toHaveBeenCalled();
    });

    it('should include context in debug messages', () => {
      logger.debug('Test with context', { userId: '123' });
      expect(console.debug).toHaveBeenCalled();
      const callArg = (console.debug as any).mock.calls[0][0];
      expect(callArg).toContain('Test with context');
      expect(callArg).toContain('userId');
    });
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(console.info).toHaveBeenCalled();
    });

    it('should include context in info messages', () => {
      logger.info('User logged in', { userId: '123' });
      expect(console.info).toHaveBeenCalled();
      const callArg = (console.info as any).mock.calls[0][0];
      expect(callArg).toContain('User logged in');
      expect(callArg).toContain('userId');
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning message');
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle Error objects', () => {
      const testError = new Error('Test error');
      logger.error('An error occurred', testError);
      expect(console.error).toHaveBeenCalled();
      const callArg = (console.error as any).mock.calls[0][0];
      expect(callArg).toContain('An error occurred');
      expect(callArg).toContain('Test error');
    });

    it('should handle non-Error objects', () => {
      logger.error('Error with object', { code: 500 });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('time', () => {
    it('should measure execution time of sync function', async () => {
      const testFn = () => 'result';
      const result = await logger.time('Test operation', testFn);
      expect(result).toBe('result');
      expect(console.debug).toHaveBeenCalled();
    });

    it('should measure execution time of async function', async () => {
      const testFn = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return 'async result';
      };
      const result = await logger.time('Async operation', testFn);
      expect(result).toBe('async result');
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log errors from failed functions', async () => {
      const testFn = () => {
        throw new Error('Function failed');
      };

      await expect(logger.time('Failed operation', testFn)).rejects.toThrow('Function failed');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('group', () => {
    it('should group related logs in development', () => {
      logger.group('Test group', () => {
        logger.info('Message in group');
      });
      // Groups are only shown in dev mode
      expect(console.group).toHaveBeenCalled();
      expect(console.groupEnd).toHaveBeenCalled();
    });
  });
});
