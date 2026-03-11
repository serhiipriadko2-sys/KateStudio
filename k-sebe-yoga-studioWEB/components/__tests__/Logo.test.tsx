import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Logo } from '../Logo';

describe('Logo', () => {
  it('renders logo image', () => {
    render(<Logo />);
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByAltText('К себе - Йога Студия')).toBeInTheDocument();
  });

  it('applies default className', () => {
    render(<Logo />);
    expect(screen.getByRole('img').parentElement?.className).toContain('w-24');
  });

  it('applies custom className', () => {
    render(<Logo className="w-40 h-48" />);
    expect(screen.getByRole('img').parentElement?.className).toContain('w-40');
  });

  it('applies white filter when color="white"', () => {
    render(<Logo color="white" />);
    const img = screen.getByRole('img');
    expect(img.style.filter).toBe('brightness(0) invert(1)');
  });

  it('applies black filter when color="#000000"', () => {
    render(<Logo color="#000000" />);
    const img = screen.getByRole('img');
    expect(img.style.filter).toBe('brightness(0)');
  });

  it('applies no filter for unknown color', () => {
    render(<Logo color="#ff0000" />);
    const img = screen.getByRole('img');
    expect(img.style.filter).toBeFalsy();
  });

  it('sets eager loading when specified', () => {
    render(<Logo loading="eager" />);
    expect(screen.getByRole('img')).toHaveAttribute('loading', 'eager');
  });
});
