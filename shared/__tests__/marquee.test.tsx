import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Marquee } from '../components/Marquee';

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
    // Phase indicator at the bottom — find it via the container
    const indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator).toBeTruthy();
    expect(indicator!.textContent).toBe('вдох');
  });

  it('switches phase indicator on animationiteration of visible track', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);
    const tracks = document.querySelectorAll('.marquee-track');
    expect(tracks.length).toBe(2);

    // Fire iteration on inhale track (index 0 = visible)
    fireEvent.animationIteration(tracks[0]);

    // Phase indicator should now show "выдох"
    const indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('выдох');
  });

  it('cycles back to inhale after two iterations', () => {
    render(<Marquee inhaleWords={['Огонь']} words={['Тишина']} />);
    const tracks = document.querySelectorAll('.marquee-track');

    // 1st → exhale
    fireEvent.animationIteration(tracks[0]);
    let indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('выдох');

    // 2nd → back to inhale
    fireEvent.animationIteration(tracks[1]);
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
