import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Marquee } from '../components/Marquee';

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

/** Simulate one breathing phase completing (fires the latest onfinish) */
function completeBreathPhase() {
  act(() => {
    const cb = finishCallbacks[finishCallbacks.length - 1];
    cb?.();
  });
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

describe('Marquee (Breathing Strip)', () => {
  it('renders both word tracks (inhale & exhale via crossfade)', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);
    expect(screen.getAllByText('Огонь').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Тишина').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelectorAll('.breath-track').length).toBe(2);
  });

  it('renders default inhale words and separator', () => {
    render(<Marquee />);
    expect(screen.getAllByText('смелость').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('вдох').length).toBeGreaterThanOrEqual(1);
  });

  it('shows phase indicator', () => {
    render(<Marquee />);
    const indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator).toBeTruthy();
    expect(indicator!.textContent).toBe('вдох');
  });

  it('switches phase when breathing animation completes (onfinish)', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);

    completeBreathPhase();

    const indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('выдох');
  });

  it('cycles back to inhale after two breath phases', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);

    // inhale → exhale
    completeBreathPhase();
    let indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('выдох');

    // exhale → inhale
    completeBreathPhase();
    indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('вдох');
  });

  it('calls Element.animate with breathing keyframes', () => {
    render(<Marquee duration={10} />);
    expect(Element.prototype.animate).toHaveBeenCalledWith(
      [
        { transform: 'scale(0.97)', letterSpacing: '0em', opacity: 0.85 },
        { transform: 'scale(1.04)', letterSpacing: '0.03em', opacity: 1 },
      ],
      { duration: 5000, easing: 'ease-in-out', fill: 'forwards' }
    );
  });

  it('does not animate when prefers-reduced-motion is enabled', () => {
    (window.matchMedia as ReturnType<typeof vi.fn>).mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));

    render(<Marquee />);
    expect(Element.prototype.animate).not.toHaveBeenCalled();
  });

  it('words are centered (justify-center) not scrolling', () => {
    render(<Marquee />);
    const tracks = document.querySelectorAll('.breath-track');
    for (const track of tracks) {
      expect(track.className).toContain('justify-center');
    }
  });
});
