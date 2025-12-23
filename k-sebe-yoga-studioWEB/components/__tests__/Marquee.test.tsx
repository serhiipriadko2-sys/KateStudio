import { act, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Marquee } from '../Marquee';

describe('Marquee', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('toggles inhale/exhale labels over time', () => {
    render(<Marquee />);

    const inhaleLabel = screen.getAllByText('Вдох')[0];
    const exhaleLabel = screen.getAllByText('Выдох')[0];

    expect(inhaleLabel.className).toContain('opacity-100');
    expect(exhaleLabel.className).toContain('opacity-0');

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(inhaleLabel.className).toContain('opacity-0');
    expect(exhaleLabel.className).toContain('opacity-100');
  });
});
