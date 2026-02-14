import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Marquee } from '../Marquee';

describe('Marquee', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with correct aria label', () => {
    render(<Marquee />);
    expect(screen.getByLabelText('Дыхательная практика: вдох и качество')).toBeInTheDocument();
  });

  it('renders initial state (Inhale)', () => {
    render(<Marquee />);
    expect(screen.getByText('вдох')).toBeInTheDocument();
  });

  it('cycles through phases', () => {
    render(<Marquee duration={4} words={['Тест']} />);

    // Initial: Inhale
    expect(screen.getByText('вдох')).toBeInTheDocument();

    // Advance 2s: Exhale
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Тест')).toBeInTheDocument();

    // Advance 2s: Inhale
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('вдох')).toBeInTheDocument();
  });
});
