import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Marquee } from '../components/Marquee';

describe('Marquee (Breathing Strip)', () => {
  it('renders inhale cycle words and separator by default', () => {
    render(<Marquee />);
    // Default inhale words should be present
    expect(screen.getAllByText('смелость').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('энергия').length).toBeGreaterThanOrEqual(1);
    // "вдох" separator should be present
    expect(screen.getAllByText('вдох').length).toBeGreaterThanOrEqual(1);
  });

  it('renders custom inhale and exhale word lists', () => {
    render(<Marquee inhaleWords={['Сила']} words={['Покой']} />);
    expect(screen.getAllByText('Сила').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('вдох').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to exhale cycle on animationiteration', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);

    // Initially shows inhale words
    expect(screen.getAllByText('Огонь').length).toBeGreaterThanOrEqual(1);

    // Simulate animation iteration on the track element
    const track = document.querySelector('.marquee-track');
    expect(track).toBeTruthy();
    fireEvent.animationIteration(track!);

    // After one iteration, should switch to exhale words
    expect(screen.getAllByText('Тишина').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('выдох').length).toBeGreaterThanOrEqual(1);
  });

  it('cycles back to inhale after two iterations', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);

    const track = document.querySelector('.marquee-track')!;
    // First iteration → exhale
    fireEvent.animationIteration(track);
    expect(screen.getAllByText('Тишина').length).toBeGreaterThanOrEqual(1);

    // Second iteration → back to inhale
    fireEvent.animationIteration(track);
    expect(screen.getAllByText('Огонь').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('вдох').length).toBeGreaterThanOrEqual(1);
  });

  it('duplicates track for seamless loop (two halves)', () => {
    render(<Marquee inhaleWords={['A']} words={['B']} />);
    // Word "A" should appear at least twice (once per half)
    expect(screen.getAllByText('A').length).toBe(2);
  });
});
