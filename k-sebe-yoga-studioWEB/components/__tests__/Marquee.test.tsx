import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Marquee } from '../Marquee';

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

describe('Marquee (WEB)', () => {
  it('renders with correct aria label', () => {
    render(<Marquee />);
    expect(screen.getByLabelText('Дыхательная полоса')).toBeInTheDocument();
  });

  it('renders both tracks (two .marquee-track elements)', () => {
    render(<Marquee />);
    const tracks = document.querySelectorAll('.marquee-track');
    expect(tracks.length).toBe(2);
  });

  it('switches phase indicator after one full loop', () => {
    render(<Marquee inhaleWords={['Энергия']} words={['Покой']} duration={20} />);

    const indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('вдох');

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(indicator!.textContent).toBe('выдох');
  });
});
