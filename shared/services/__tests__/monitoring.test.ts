import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { monitoring } from '../monitoring';

const {
  addBreadcrumbMock,
  browserTracingIntegrationMock,
  captureExceptionMock,
  initMock,
  setExtrasMock,
  setUserMock,
  withScopeMock,
} = vi.hoisted(() => {
  const setExtrasMock = vi.fn();

  return {
    addBreadcrumbMock: vi.fn(),
    browserTracingIntegrationMock: vi.fn(() => ({ name: 'browserTracingIntegration' })),
    captureExceptionMock: vi.fn(),
    initMock: vi.fn(),
    setExtrasMock,
    setUserMock: vi.fn(),
    withScopeMock: vi.fn((callback: (scope: { setExtras: typeof setExtrasMock }) => void) => {
      callback({ setExtras: setExtrasMock });
    }),
  };
});

vi.mock('@sentry/react', () => ({
  addBreadcrumb: addBreadcrumbMock,
  browserTracingIntegration: browserTracingIntegrationMock,
  captureException: captureExceptionMock,
  init: initMock,
  setUser: setUserMock,
  withScope: withScopeMock,
}));

describe('monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('init with no DSN is a no-op', async () => {
    await expect(monitoring.init()).resolves.toBeUndefined();
    expect(initMock).not.toHaveBeenCalled();
  });

  it('init with DSN initializes Sentry without network side effects in tests', async () => {
    await expect(monitoring.init({ dsn: 'https://fake@sentry.io/1' })).resolves.toBeUndefined();
    expect(browserTracingIntegrationMock).toHaveBeenCalledTimes(1);
    expect(initMock).toHaveBeenCalledTimes(1);
  });

  it('captureError logs to console and forwards to Sentry', async () => {
    const err = new Error('boom');

    await expect(monitoring.captureError(err)).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalledWith('[monitoring]', err, undefined);
    expect(captureExceptionMock).toHaveBeenCalledWith(err);
  });

  it('captureError with context logs context and sets extras', async () => {
    const err = new Error('ctx error');
    const ctx = { userId: '123' };

    await expect(monitoring.captureError(err, ctx)).resolves.toBeUndefined();

    expect(console.error).toHaveBeenCalledWith('[monitoring]', err, ctx);
    expect(withScopeMock).toHaveBeenCalledTimes(1);
    expect(setExtrasMock).toHaveBeenCalledWith(ctx);
    expect(captureExceptionMock).toHaveBeenCalledWith(err);
  });

  it('setUser delegates to Sentry', async () => {
    const user = { id: 'u1', email: 'u@test.ru' };

    await expect(monitoring.setUser(user)).resolves.toBeUndefined();

    expect(setUserMock).toHaveBeenCalledWith(user);
  });

  it('setUser(null) clears the Sentry user', async () => {
    await expect(monitoring.setUser(null)).resolves.toBeUndefined();
    expect(setUserMock).toHaveBeenCalledWith(null);
  });

  it('addBreadcrumb delegates to Sentry', async () => {
    await expect(monitoring.addBreadcrumb('page view', { page: '/home' })).resolves.toBeUndefined();

    expect(addBreadcrumbMock).toHaveBeenCalledWith({
      data: { page: '/home' },
      level: 'info',
      message: 'page view',
    });
  });
});
