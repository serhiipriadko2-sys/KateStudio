import { render, screen, act, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../ToastContext';

const ToastTrigger = ({
  message,
  type,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
}) => {
  const { showToast } = useToast();
  return (
    <button type="button" onClick={() => showToast(message, type)}>
      show
    </button>
  );
};

describe('ToastContext', () => {
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
  });

  it('shows a success toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Всё сохранено!" type="success" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('Всё сохранено!')).toBeInTheDocument();
  });

  it('shows an info toast (default type)', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Информация" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('Информация')).toBeInTheDocument();
  });

  it('shows error toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Ошибка!" type="error" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('Ошибка!')).toBeInTheDocument();
  });

  it('shows warning toast', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Внимание!" type="warning" />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('Внимание!')).toBeInTheDocument();
  });

  it('auto-removes toast after 3 seconds', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastTrigger message="Временный тост" type="info" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('Временный тост')).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.queryByText('Временный тост')).not.toBeInTheDocument();
  });

  it('removes toast when close button is clicked', () => {
    render(
      <ToastProvider>
        <ToastTrigger message="Закрыть меня" type="error" />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('show'));
    expect(screen.getByText('Закрыть меня')).toBeInTheDocument();

    const allButtons = screen.getAllByRole('button');
    const closeBtn = allButtons.find((btn) => btn.textContent !== 'show');
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn!);

    expect(screen.queryByText('Закрыть меня')).not.toBeInTheDocument();
  });

  it('throws when useToast is called outside ToastProvider', () => {
    const BadComponent = () => {
      useToast();
      return null;
    };
    expect(() => render(<BadComponent />)).toThrow('useToast must be used within a ToastProvider');
  });
});
