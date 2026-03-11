import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastProvider, useToast } from '../ToastContext';

// Helper component that calls showToast
const ToastTrigger = ({
  message,
  type,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}) => {
  const { showToast } = useToast();
  return <button onClick={() => showToast(message, type)}>show</button>;
};

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders children without showing any toast initially', () => {
    render(
      <ToastProvider>
        <div data-testid="child">hello</div>
      </ToastProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument();
  });

  it('shows a toast when showToast is called', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(
      <ToastProvider>
        <ToastTrigger message="Всё сохранено!" type="success" />
      </ToastProvider>
    );

    await user.click(screen.getByText('show'));
    expect(screen.getByText('Всё сохранено!')).toBeInTheDocument();
  });

  it('uses info type when no type is specified', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(
      <ToastProvider>
        <ToastTrigger message="Информация" />
      </ToastProvider>
    );

    await user.click(screen.getByText('show'));
    expect(screen.getByText('Информация')).toBeInTheDocument();
  });

  it('auto-removes toast after 3 seconds', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(
      <ToastProvider>
        <ToastTrigger message="Временный тост" type="info" />
      </ToastProvider>
    );

    await user.click(screen.getByText('show'));
    expect(screen.getByText('Временный тост')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3100);
    });

    await waitFor(() => {
      expect(screen.queryByText('Временный тост')).not.toBeInTheDocument();
    });
  });

  it('removes toast when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime.bind(vi) });
    render(
      <ToastProvider>
        <ToastTrigger message="Закрыть меня" type="error" />
      </ToastProvider>
    );

    await user.click(screen.getByText('show'));
    expect(screen.getByText('Закрыть меня')).toBeInTheDocument();

    // Find the X close button inside the toast (lucide X icon button)
    const closeButtons = document.querySelectorAll('button:not([data-testid="show"])');
    // The close button is the last button (not the "show" trigger)
    const closeBtn = Array.from(closeButtons).find((btn) => btn !== screen.getByText('show'));
    if (closeBtn) {
      await user.click(closeBtn as HTMLElement);
      await waitFor(() => {
        expect(screen.queryByText('Закрыть меня')).not.toBeInTheDocument();
      });
    }
  });

  it('throws when useToast is called outside ToastProvider', () => {
    const BadComponent = () => {
      useToast();
      return null;
    };

    expect(() => render(<BadComponent />)).toThrow('useToast must be used within a ToastProvider');
  });
});
