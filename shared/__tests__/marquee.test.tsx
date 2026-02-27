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

  it('does not render a standalone phase indicator label', () => {
    render(<Marquee />);
    // Phase indicator was removed — only in-track separators remain
    const section = document.querySelector('[aria-label="Дыхательная полоса"]');
    const standaloneLabel = section?.querySelector('.flex.justify-center.mt-2');
    expect(standaloneLabel).toBeNull();
  });

  it('switches phase when breathing animation completes (onfinish)', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);

    // Inhale track visible (opacity: 1), exhale hidden (opacity: 0)
    const tracks = document.querySelectorAll('.breath-track') as NodeListOf<HTMLElement>;
    expect(tracks[0].style.opacity).toBe('1');
    expect(tracks[1].style.opacity).toBe('0');

    completeBreathPhase();

    // After one phase: exhale visible, inhale hidden
    expect(tracks[0].style.opacity).toBe('0');
    expect(tracks[1].style.opacity).toBe('1');
  });

  it('cycles back to inhale after two breath phases', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);
    const tracks = document.querySelectorAll('.breath-track') as NodeListOf<HTMLElement>;

    completeBreathPhase(); // → exhale
    expect(tracks[1].style.opacity).toBe('1');

    completeBreathPhase(); // → inhale
    expect(tracks[0].style.opacity).toBe('1');
  });

  it('calls Element.animate with vertical float keyframes', () => {
    render(<Marquee duration={10} />);
    expect(Element.prototype.animate).toHaveBeenCalledWith(
      [
        { transform: 'translateY(2px)', opacity: 0.92 },
        { transform: 'translateY(-2px)', opacity: 1 },
      ],
      { duration: 5000, easing: 'ease-in-out', fill: 'forwards' }
    );
  });

  it('falls back to timer-based phase switching when Web Animations API is unavailable', () => {
    vi.useFakeTimers();
    const originalAnimate = Element.prototype.animate;
    Object.defineProperty(Element.prototype, 'animate', {
      value: undefined,
      configurable: true,
    });

    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} duration={2} />);

    const tracks = document.querySelectorAll('.breath-track') as NodeListOf<HTMLElement>;
    expect(tracks[0].style.opacity).toBe('1');
    expect(tracks[1].style.opacity).toBe('0');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(tracks[0].style.opacity).toBe('0');
    expect(tracks[1].style.opacity).toBe('1');

    vi.useRealTimers();
    Object.defineProperty(Element.prototype, 'animate', {
      value: originalAnimate,
      configurable: true,
    });
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

  it('cancels previous animation before starting a new phase', () => {
    render(<Marquee duration={10} />);

    const firstAnim = (Element.prototype.animate as ReturnType<typeof vi.fn>).mock.results[0].value;

    completeBreathPhase(); // inhale → exhale

    expect(firstAnim.cancel).toHaveBeenCalled();
  });

  it('increments cycle count once per full breath cycle, not per phase', () => {
    const inhaleWords = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const exhaleWords = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    render(<Marquee inhaleWords={inhaleWords} words={exhaleWords} duration={10} />);

    const tracks = document.querySelectorAll('.breath-track') as NodeListOf<HTMLElement>;

    // Initial: inhale track shows 'A' first
    expect(tracks[0].textContent).toContain('A');

    // inhale → exhale: cycleCount should NOT increment yet
    completeBreathPhase();

    // exhale → inhale: now cycleCount increments to 1, words rotate by 1
    completeBreathPhase();

    // After one full cycle, inhale words should start from 'B'
    expect(tracks[0].textContent).toContain('B');
  });
});
