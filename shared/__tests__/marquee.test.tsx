import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { Marquee } from '../components/Marquee';

describe('Marquee Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render initial state (Inhale)', () => {
    render(<Marquee duration={4} />);
    expect(screen.getByText('вдох')).toBeInTheDocument();
  });

  it('should cycle to Exhale word after half duration', () => {
    render(<Marquee duration={4} words={['Тест']} />);

    // Initial state
    expect(screen.getByText('вдох')).toBeInTheDocument();

    // Advance 2 seconds (half of 4s)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should show exhale word
    expect(screen.getByText('Тест')).toBeInTheDocument();
    expect(screen.queryByText('вдох')).not.toBeInTheDocument();
  });

  it('should cycle back to Inhale word after full duration', () => {
    render(<Marquee duration={4} words={['Тест']} />);

    // Advance 4 seconds (full cycle)
    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByText('вдох')).toBeInTheDocument();
  });

  it('should cycle through exhale words', () => {
    render(<Marquee duration={4} words={['Один', 'Два']} />);

    // 0s: Inhale
    expect(screen.getByText('вдох')).toBeInTheDocument();

    // 2s: Exhale "Один"
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Один')).toBeInTheDocument();

    // 4s: Inhale
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('вдох')).toBeInTheDocument();

    // 6s: Exhale "Два"
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Два')).toBeInTheDocument();
  });
});
