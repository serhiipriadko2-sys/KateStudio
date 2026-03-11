import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BackToTop } from '../BackToTop';

describe('BackToTop', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { writable: true, value: 0 });
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is hidden by default (scrollY=0)', () => {
    render(<BackToTop />);
    const btn = screen.getByRole('button', { name: /back to top/i });
    expect(btn.className).toContain('opacity-0');
  });

  it('becomes visible when scrollY exceeds threshold', () => {
    render(<BackToTop threshold={100} />);
    Object.defineProperty(window, 'scrollY', { writable: true, value: 200 });
    act(() => {
      fireEvent.scroll(window);
    });
    const btn = screen.getByRole('button', { name: /back to top/i });
    expect(btn.className).toContain('opacity-100');
  });

  it('calls window.scrollTo when clicked', () => {
    // Make button visible first
    Object.defineProperty(window, 'scrollY', { writable: true, value: 600 });
    render(<BackToTop />);
    act(() => {
      fireEvent.scroll(window);
    });
    fireEvent.click(screen.getByRole('button', { name: /back to top/i }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('positions button on the right when position="right"', () => {
    render(<BackToTop position="right" />);
    const btn = screen.getByRole('button', { name: /back to top/i });
    expect(btn.className).toContain('right-6');
  });

  it('applies custom className', () => {
    render(<BackToTop className="my-custom-class" />);
    const btn = screen.getByRole('button', { name: /back to top/i });
    expect(btn.className).toContain('my-custom-class');
  });
});
