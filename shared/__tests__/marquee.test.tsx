import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { Marquee } from '../components/Marquee';

// Mock usePrefersReducedMotion
vi.mock('../hooks', () => ({
  usePrefersReducedMotion: vi.fn(() => false),
}));

describe('Marquee Component', () => {
  it('should render initial state (Inhale cycle)', () => {
    render(<Marquee />);
    // Check for Inhale words (using getAllByText because words are repeated)
    expect(screen.getAllByText('смелость')[0]).toBeInTheDocument();
    expect(screen.getAllByText('энергия')[0]).toBeInTheDocument();
    // Check for separator
    expect(screen.getAllByText('вдох')[0]).toBeInTheDocument();
    // Ensure Exhale words are NOT present
    expect(screen.queryByText('гармония')).not.toBeInTheDocument();
  });

  it('should switch to Exhale cycle on animation iteration', () => {
    const { container } = render(<Marquee />);
    const marqueeInner = container.querySelector('.animate-marquee');
    expect(marqueeInner).toBeInTheDocument();

    // Trigger animation iteration
    fireEvent.animationIteration(marqueeInner!);

    // Check for Exhale words
    expect(screen.getAllByText('гармония')[0]).toBeInTheDocument();
    expect(screen.getAllByText('покой')[0]).toBeInTheDocument();
    // Check for separator
    expect(screen.getAllByText('Выдох')[0]).toBeInTheDocument();
    // Ensure Inhale words are gone
    expect(screen.queryByText('смелость')).not.toBeInTheDocument();
  });

  it('should switch back to Inhale cycle on next iteration', () => {
    const { container } = render(<Marquee />);
    const marqueeInner = container.querySelector('.animate-marquee');

    // First iteration -> Exhale
    fireEvent.animationIteration(marqueeInner!);
    expect(screen.getAllByText('гармония')[0]).toBeInTheDocument();

    // Second iteration -> Inhale
    fireEvent.animationIteration(marqueeInner!);
    expect(screen.getAllByText('смелость')[0]).toBeInTheDocument();
  });

  it('should have correct accessibility attributes', () => {
    render(<Marquee />);
    const section = screen.getByRole('marquee');
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute('aria-label', 'Дыхательная практика: Вдох');

    // Trigger iteration
    const marqueeInner = section.querySelector('.animate-marquee');
    fireEvent.animationIteration(marqueeInner!);

    expect(section).toHaveAttribute('aria-label', 'Дыхательная практика: Выдох');
  });
});
