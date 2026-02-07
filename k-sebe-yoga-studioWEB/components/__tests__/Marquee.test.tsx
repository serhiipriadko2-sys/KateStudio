import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Marquee } from '../Marquee';

/* ── Environment mocks ──────────────────────────────────── */

beforeAll(() => {
  // IntersectionObserver (component pauses when off-screen)
  window.IntersectionObserver = vi.fn().mockImplementation((cb: IntersectionObserverCallback) => {
    // Immediately report as visible so the timer starts
    cb([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    return { observe: vi.fn(), unobserve: vi.fn(), disconnect: vi.fn() };
  }) as unknown as typeof IntersectionObserver;

  // matchMedia (usePrefersReducedMotion)
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe('Marquee', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with accessible aria label', () => {
    render(<Marquee />);
    expect(screen.getByLabelText('Дыхательный поток: вдох и выдох')).toBeInTheDocument();
  });

  it('renders both Вдох and Выдох text in layers', () => {
    render(<Marquee />);
    expect(screen.getAllByText('Вдох').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Выдох').length).toBeGreaterThan(0);
  });

  it('toggles inhale / exhale phase description over time', () => {
    render(<Marquee />);

    // Initially in inhale phase
    expect(screen.getByText(/Фаза вдоха/)).toBeInTheDocument();

    // After one cycle (default 5000ms), switches to exhale
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/Фаза выдоха/)).toBeInTheDocument();

    // After another cycle, back to inhale
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText(/Фаза вдоха/)).toBeInTheDocument();
  });

  it('respects custom cycleDuration', () => {
    render(<Marquee cycleDuration={2000} />);

    expect(screen.getByText(/Фаза вдоха/)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText(/Фаза выдоха/)).toBeInTheDocument();
  });
});
