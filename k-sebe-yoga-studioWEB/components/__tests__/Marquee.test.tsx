import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Marquee } from '../Marquee';

describe('Marquee (WEB)', () => {
  it('renders with correct aria label', () => {
    render(<Marquee />);
    expect(screen.getByLabelText('Дыхательная полоса')).toBeInTheDocument();
  });

  it('renders inhale words initially', () => {
    render(<Marquee />);
    expect(screen.getAllByText('вдох').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('смелость').length).toBeGreaterThanOrEqual(1);
  });

  it('switches to exhale on animation iteration', () => {
    render(<Marquee inhaleWords={['Энергия']} words={['Покой']} />);
    expect(screen.getAllByText('Энергия').length).toBeGreaterThanOrEqual(1);

    const track = document.querySelector('.marquee-track')!;
    fireEvent.animationIteration(track);

    expect(screen.getAllByText('Покой').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('выдох').length).toBeGreaterThanOrEqual(1);
  });
});
