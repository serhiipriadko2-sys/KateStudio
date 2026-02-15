import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Marquee } from '../Marquee';

/* ─── Mock Web Animations API ─────────────────────────── */

let finishCallbacks: (() => void)[] = [];

function mockAnimate() {
  const anim = {
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
    onfinish: null as (() => void) | null,
  };
  const proxy = new Proxy(anim, {
    set(target, prop, value) {
      if (prop === 'onfinish' && typeof value === 'function') {
        finishCallbacks.push(value);
      }
      return Reflect.set(target, prop, value);
    },
  });
  return proxy;
}

beforeEach(() => {
  finishCallbacks = [];
  Element.prototype.animate = vi.fn().mockImplementation(() => mockAnimate());
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});
afterEach(() => {
  vi.restoreAllMocks();
});

/* ─── Tests ───────────────────────────────────────────── */

describe('Marquee (WEB)', () => {
  it('renders with correct aria label', () => {
    render(<Marquee />);
    expect(screen.getByLabelText('Дыхательная полоса')).toBeInTheDocument();
  });

  it('renders both breath tracks', () => {
    render(<Marquee />);
    const tracks = document.querySelectorAll('.breath-track');
    expect(tracks.length).toBe(2);
  });

  it('switches visible track when breath phase completes', () => {
    render(<Marquee inhaleWords={['Энергия']} words={['Покой']} />);

    const tracks = document.querySelectorAll('.breath-track');
    expect(tracks[0].className).toContain('opacity-100');

    act(() => {
      const cb = finishCallbacks[finishCallbacks.length - 1];
      cb?.();
    });

    expect(tracks[0].className).toContain('opacity-0');
    expect(tracks[1].className).toContain('opacity-100');
  });
});
