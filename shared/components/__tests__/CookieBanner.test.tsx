import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CookieBanner } from '../CookieBanner';

describe('CookieBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is not visible initially (before delay)', () => {
    render(<CookieBanner storageKey="test-cookie" delay={2000} />);
    expect(screen.queryByText(/мы используем/i)).not.toBeInTheDocument();
  });

  it('becomes visible after delay', () => {
    render(<CookieBanner storageKey="test-cookie" delay={500} />);
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByText(/мы используем cookie/i)).toBeInTheDocument();
  });

  it('does not show if already consented', () => {
    localStorage.setItem('test-cookie', 'true');
    render(<CookieBanner storageKey="test-cookie" delay={0} />);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.queryByText(/мы используем cookie/i)).not.toBeInTheDocument();
  });

  it('calls onAccept and hides when Accept is clicked', () => {
    const onAccept = vi.fn();
    render(<CookieBanner storageKey="test-cookie2" delay={0} onAccept={onAccept} />);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    fireEvent.click(screen.getByText('Принять'));
    expect(onAccept).toHaveBeenCalled();
    expect(screen.queryByText(/мы используем cookie/i)).not.toBeInTheDocument();
    expect(localStorage.getItem('test-cookie2')).toBe('true');
  });

  it('calls onClose and hides when Закрыть is clicked', () => {
    const onClose = vi.fn();
    render(<CookieBanner storageKey="test-cookie3" delay={0} onClose={onClose} />);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Click the text "Закрыть" button in the footer
    const closeButtons = screen.getAllByText('Закрыть');
    fireEvent.click(closeButtons[closeButtons.length - 1]);
    expect(onClose).toHaveBeenCalled();
    expect(screen.queryByText(/мы используем cookie/i)).not.toBeInTheDocument();
  });
});
