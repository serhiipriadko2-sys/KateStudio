import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Marquee } from '../components/Marquee';

/* Mock Web Animations API (not available in jsdom) */
beforeEach(() => {
  vi.useFakeTimers();
  Element.prototype.animate = vi.fn().mockReturnValue({
    cancel: vi.fn(),
    pause: vi.fn(),
    play: vi.fn(),
  });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('Marquee (Breathing Strip)', () => {
  it('renders both tracks simultaneously (crossfade)', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);
    // Both always in DOM
    expect(screen.getAllByText('Огонь').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Тишина').length).toBeGreaterThanOrEqual(1);
    // Two .marquee-track elements
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

  it('switches phase after one full loop (setInterval-based)', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} duration={20} />);

    // Advance by one full animation loop (20s)
    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    const indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('выдох');
  });

  it('cycles back to inhale after two loops', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} duration={20} />);

    // 1st loop → exhale
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    let indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('выдох');

    // 2nd loop → back to inhale
    act(() => {
      vi.advanceTimersByTime(20_000);
    });
    indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('вдох');
  });

  it('duplicates each track for seamless loop (two halves)', () => {
    render(<Marquee inhaleWords={['A']} words={['B']} />);
    // "A" = 2 halves in inhale track
    expect(screen.getAllByText('A').length).toBe(2);
    // "B" = 2 halves in exhale track
    expect(screen.getAllByText('B').length).toBe(2);
  });
});
