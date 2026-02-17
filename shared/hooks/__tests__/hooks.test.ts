import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
/* eslint-disable import/order */

// ---------------------------------------------------------------------------
// 1. useDebounce
// ---------------------------------------------------------------------------
import { useDebounce, useDebouncedCallback } from '../useDebounce';
// ---------------------------------------------------------------------------
// 2. useLocalStorage
// ---------------------------------------------------------------------------
import { useLocalStorage } from '../useLocalStorage';
// ---------------------------------------------------------------------------
// 3. useMediaQuery
// ---------------------------------------------------------------------------
import { useMediaQuery } from '../useMediaQuery';
// ---------------------------------------------------------------------------
// 4. useOnlineStatus
// ---------------------------------------------------------------------------
import { useOnlineStatus } from '../useOnlineStatus';
// ---------------------------------------------------------------------------
// 5. usePWAMode
// ---------------------------------------------------------------------------
import { usePWAMode } from '../usePWAMode';
// ---------------------------------------------------------------------------
// 6. useScrollLock
// ---------------------------------------------------------------------------
import { useScrollLock } from '../useScrollLock';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'hello', delay: 500 },
    });

    // Update value
    rerender({ value: 'world', delay: 500 });

    // Before delay elapses, debounced value should still be the old value
    expect(result.current).toBe('hello');

    // Advance time past the delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');
  });

  it('should reset the timer when value changes rapidly', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'b' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Change again before the first debounce fires
    rerender({ value: 'c' });
    act(() => {
      vi.advanceTimersByTime(200);
    });

    // Only 200ms since last change -- still 'a'
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Now 300ms since last change to 'c'
    expect(result.current).toBe('c');
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce the callback invocation', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));

    act(() => {
      result.current('arg1');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('arg1');
  });

  it('should only invoke the last call when called multiple times', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 200));

    act(() => {
      result.current('first');
      result.current('second');
      result.current('third');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });
});

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return the initial value when nothing is stored', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 42));
    expect(result.current[0]).toBe(42);
  });

  it('should persist and read values from localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('updated');
  });

  it('should remove value with the remove function', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('stored');
    });

    act(() => {
      result.current[2](); // removeValue
    });

    expect(result.current[0]).toBe('default');
    expect(localStorage.getItem('test-key')).toBeNull();
  });
});

describe('useMediaQuery', () => {
  let listeners: Record<string, ((e: { matches: boolean }) => void)[]>;

  beforeEach(() => {
    listeners = {};

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((_event: string, handler: (e: { matches: boolean }) => void) => {
          if (!listeners[query]) listeners[query] = [];
          listeners[query].push(handler);
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should return false when the query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);
  });

  it('should return true when the query matches', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });

  it('should update when the media query changes', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      const cbs = listeners['(min-width: 768px)'] || [];
      cbs.forEach((cb) => cb({ matches: true }));
    });

    expect(result.current).toBe(true);
  });
});

describe('useOnlineStatus', () => {
  const originalOnLine = navigator.onLine;

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: originalOnLine,
    });
  });

  it('should return true when the browser is online', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);
  });

  it('should update to false when an offline event fires', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current).toBe(false);
  });

  it('should update to true when an online event fires after being offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current).toBe(true);
  });
});

describe('usePWAMode', () => {
  beforeEach(() => {
    // Reset matchMedia to default (no standalone)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Reset document.referrer
    Object.defineProperty(document, 'referrer', {
      writable: true,
      configurable: true,
      value: '',
    });

    // Reset navigator.standalone
    Object.defineProperty(navigator, 'standalone', {
      writable: true,
      configurable: true,
      value: undefined,
    });
  });

  it('should return "browser" by default', () => {
    const { result } = renderHook(() => usePWAMode());
    expect(result.current).toBe('browser');
  });

  it('should return "standalone" when display-mode: standalone matches', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => usePWAMode());
    expect(result.current).toBe('standalone');
  });

  it('should return "twa" when referrer is an android app', () => {
    Object.defineProperty(document, 'referrer', {
      writable: true,
      configurable: true,
      value: 'android-app://com.example.app',
    });

    const { result } = renderHook(() => usePWAMode());
    expect(result.current).toBe('twa');
  });
});

describe('useScrollLock', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  it('should set body overflow to hidden when locked', () => {
    renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should not change body overflow when not locked', () => {
    document.body.style.overflow = 'auto';
    renderHook(() => useScrollLock(false));
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should restore original overflow when unmounted', () => {
    // jsdom getComputedStyle returns '' for overflow by default
    const { unmount } = renderHook(() => useScrollLock(true));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    // Should restore to original computed value ('' in jsdom)
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});