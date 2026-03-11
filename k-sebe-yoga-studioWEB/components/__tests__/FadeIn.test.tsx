import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FadeIn } from '../FadeIn';

describe('FadeIn (WEB)', () => {
  it('renders children', () => {
    const { getByText } = render(<FadeIn>Привет</FadeIn>);
    expect(getByText('Привет')).toBeInTheDocument();
  });

  it('applies opacity-0 initially (IntersectionObserver not triggered)', () => {
    const { container } = render(<FadeIn>Content</FadeIn>);
    expect(container.firstChild).toHaveClass('opacity-0');
  });

  it('applies translate-y-12 for direction="up" (default)', () => {
    const { container } = render(<FadeIn direction="up">Content</FadeIn>);
    expect(container.firstChild).toHaveClass('translate-y-12');
  });

  it('applies -translate-y-12 for direction="down"', () => {
    const { container } = render(<FadeIn direction="down">Content</FadeIn>);
    expect(container.firstChild).toHaveClass('-translate-y-12');
  });

  it('applies translate-x-12 for direction="left"', () => {
    const { container } = render(<FadeIn direction="left">Content</FadeIn>);
    expect(container.firstChild).toHaveClass('translate-x-12');
  });

  it('applies -translate-x-12 for direction="right"', () => {
    const { container } = render(<FadeIn direction="right">Content</FadeIn>);
    expect(container.firstChild).toHaveClass('-translate-x-12');
  });

  it('applies no transform for direction="none"', () => {
    const { container } = render(<FadeIn direction="none">Content</FadeIn>);
    const el = container.firstChild as HTMLElement;
    expect(el.className).not.toContain('translate-y-12');
  });

  it('applies delay via inline style', () => {
    const { container } = render(<FadeIn delay={300}>Content</FadeIn>);
    const el = container.firstChild as HTMLElement;
    expect(el.style.transitionDelay).toBe('300ms');
  });

  it('applies w-full when fullWidth=true', () => {
    const { container } = render(<FadeIn fullWidth>Content</FadeIn>);
    expect(container.firstChild).toHaveClass('w-full');
  });

  it('applies custom className', () => {
    const { container } = render(<FadeIn className="my-custom">Content</FadeIn>);
    expect(container.firstChild).toHaveClass('my-custom');
  });
});
