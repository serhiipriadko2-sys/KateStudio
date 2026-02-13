import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { Marquee } from '../Marquee';

describe('Marquee', () => {
  it('renders with accessible aria label', () => {
    render(<Marquee />);
    expect(screen.getByLabelText('Бегущая строка с ценностями студии')).toBeInTheDocument();
  });

  it('renders content words', () => {
    render(<Marquee words={['Тест', 'Слово']} />);
    // Should render multiple times due to looping
    const elements = screen.getAllByText('Тест');
    expect(elements.length).toBeGreaterThan(1);
    expect(screen.getAllByText('Слово').length).toBeGreaterThan(1);
  });

  it('applies animation classes', () => {
    const { container } = render(<Marquee />);
    const animatedContainer = container.querySelector('.animate-marquee');
    expect(animatedContainer).toBeInTheDocument();
  });

  it('respects direction prop', () => {
    const { container } = render(<Marquee direction="right" />);
    // Our implementation uses inline style for direction or class, checking inline style here based on implementation
    const animatedDiv = container.querySelector('.animate-marquee');
    expect(animatedDiv).toHaveStyle({ animationDirection: 'reverse' });
  });
});
