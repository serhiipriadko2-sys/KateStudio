import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Marquee } from '../Marquee';

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

  it('switches phase indicator on animation iteration', () => {
    render(<Marquee inhaleWords={['Энергия']} words={['Покой']} />);

    // Phase indicator starts as "вдох"
    const indicator = document.querySelector('.flex.justify-center.mt-2 span');
    expect(indicator!.textContent).toBe('вдох');

    const tracks = document.querySelectorAll('.marquee-track');
    fireEvent.animationIteration(tracks[0]);

    expect(indicator!.textContent).toBe('выдох');
  });
});
