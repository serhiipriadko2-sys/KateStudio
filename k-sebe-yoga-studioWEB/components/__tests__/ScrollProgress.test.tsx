import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ScrollProgress } from '../ScrollProgress';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ScrollProgress', () => {
  it('updates the transform based on scroll position', () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });

    const { container } = render(<ScrollProgress />);

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 500,
    });

    window.dispatchEvent(new Event('scroll'));

    // First match for "div > div" is the wrapper; we need the inner bar element.
    const bar = container.querySelector('div > div > div');
    expect(bar).not.toBeNull();
    expect((bar as HTMLDivElement).style.transform).toBe('scaleX(0.5)');
  });
});
