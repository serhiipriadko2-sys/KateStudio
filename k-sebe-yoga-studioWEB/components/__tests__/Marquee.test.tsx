import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { Marquee } from '../Marquee';

// Mock usePrefersReducedMotion
vi.mock('@ksebe/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ksebe/shared')>();
  return {
    ...actual,
    usePrefersReducedMotion: vi.fn(() => false),
  };
});

describe('Marquee Component', () => {
  it('renders initial state (Inhale)', () => {
    render(<Marquee />);
    // Check for multiple instances due to infinite scroll duplication
    const inhaleWords = screen.getAllByText('вдох');
    expect(inhaleWords.length).toBeGreaterThan(0);
    expect(inhaleWords[0]).toBeInTheDocument();

    const energyWords = screen.getAllByText('энергия');
    expect(energyWords.length).toBeGreaterThan(0);
  });

  it('cycles through phases', () => {
    const { container } = render(<Marquee />);
    const marqueeInner = container.querySelector('.animate-marquee');
    expect(marqueeInner).toBeInTheDocument();

    // Initial: Inhale
    expect(screen.getAllByText('вдох')[0]).toBeInTheDocument();

    // Trigger animation iteration -> Exhale
    fireEvent.animationIteration(marqueeInner!);

    // Check for Exhale words
    expect(screen.getAllByText('Выдох')[0]).toBeInTheDocument();
    expect(screen.getAllByText('гармония')[0]).toBeInTheDocument();

    // Trigger animation iteration -> Inhale
    fireEvent.animationIteration(marqueeInner!);
    expect(screen.getAllByText('вдох')[0]).toBeInTheDocument();
  });
});
