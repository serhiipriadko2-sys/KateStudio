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
  // Capture onfinish when it's set (via property assignment)
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

/** Simulate one full marquee loop completing.
 *  Fires ALL pending onfinish callbacks — only the visible track's
 *  onIterationRef is set, so only that one triggers the phase switch. */
function completeOneLoop() {
  act(() => {
    const cbs = [...finishCallbacks];
    finishCallbacks = [];
    for (const cb of cbs) cb();
  });
}

beforeEach(() => {
  finishCallbacks = [];
  Element.prototype.animate = vi.fn().mockImplementation(() => mockAnimate());
  // Ensure reduced-motion is off in tests
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
  it('renders both tracks simultaneously (crossfade)', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);
    expect(screen.getAllByText('Огонь').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Тишина').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelectorAll('.marquee-track').length).toBe(2);
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

  it('switches phase when animation completes one full loop (onfinish)', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} duration={20} />);

    // Simulate the visible track completing one full pass
    completeOneLoop();

    const indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('выдох');
  });

  it('cycles back to inhale after two full loops', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} duration={20} />);

    // 1st loop → exhale
    completeOneLoop();
    let indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('выдох');

    // 2nd loop → back to inhale
    completeOneLoop();
    indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('вдох');
  });

  it('duplicates each track for seamless loop (two halves)', () => {
    render(<Marquee inhaleWords={['A']} words={['B']} />);
    expect(screen.getAllByText('A').length).toBe(2);
    expect(screen.getAllByText('B').length).toBe(2);
  });

  it('calls Element.animate with correct params', () => {
    render(<Marquee duration={15} />);
    expect(Element.prototype.animate).toHaveBeenCalledWith(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }],
      { duration: 15_000, easing: 'linear' }
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
});
