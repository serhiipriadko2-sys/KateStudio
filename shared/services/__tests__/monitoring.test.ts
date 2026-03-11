import { describe, it, expect, vi, beforeEach } from 'vitest';
import { monitoring } from '../monitoring';

// @sentry/react is not installed — dynamic import will silently fail (getSentry returns null).
// This means all monitoring methods become no-ops, which we verify below.

describe('monitoring', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('init with no DSN is a no-op', async () => {
    await expect(monitoring.init()).resolves.toBeUndefined();
  });

  it('init with DSN does not throw when Sentry is not installed', async () => {
    await expect(monitoring.init({ dsn: 'https://fake@sentry.io/1' })).resolves.toBeUndefined();
  });

  it('captureError logs to console and does not throw', async () => {
    const err = new Error('boom');
    await expect(monitoring.captureError(err)).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith('[monitoring]', err, undefined);
  });

  it('captureError with context logs context', async () => {
    const err = new Error('ctx error');
    const ctx = { userId: '123' };
    await expect(monitoring.captureError(err, ctx)).resolves.toBeUndefined();
    expect(console.error).toHaveBeenCalledWith('[monitoring]', err, ctx);
  });

  it('setUser does not throw when Sentry is not installed', async () => {
    await expect(monitoring.setUser({ id: 'u1', email: 'u@test.ru' })).resolves.toBeUndefined();
  });

  it('setUser(null) does not throw', async () => {
    await expect(monitoring.setUser(null)).resolves.toBeUndefined();
  });

  it('addBreadcrumb does not throw when Sentry is not installed', async () => {
    await expect(monitoring.addBreadcrumb('page view', { page: '/home' })).resolves.toBeUndefined();
  });
});
