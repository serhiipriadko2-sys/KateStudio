import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registerServiceWorker } from '../serviceWorker';

describe('registerServiceWorker', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing when serviceWorker is not in navigator', () => {
    // Remove serviceWorker from navigator
    const originalSW = navigator.serviceWorker;
    Object.defineProperty(navigator, 'serviceWorker', {
      value: undefined,
      configurable: true,
    });

    expect(() =>
      registerServiceWorker({ onUpdate: vi.fn(), onOfflineReady: vi.fn() })
    ).not.toThrow();

    // Restore
    Object.defineProperty(navigator, 'serviceWorker', {
      value: originalSW,
      configurable: true,
    });
  });

  it('registers load event listener when serviceWorker is available', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    // Ensure serviceWorker is "present"
    if (!('serviceWorker' in navigator)) {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: vi.fn().mockResolvedValue({ waiting: null, addEventListener: vi.fn() }),
        },
        configurable: true,
      });
    }

    registerServiceWorker({});

    expect(addEventListenerSpy).toHaveBeenCalledWith('load', expect.any(Function));
  });
});
