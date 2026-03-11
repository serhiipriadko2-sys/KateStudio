import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Logo to avoid SVG complexity
vi.mock('../Logo', () => ({
  Logo: () => <div data-testid="logo" />,
}));

// Use vi.hoisted so mockUseAuth is available inside the vi.mock factory
const mockUseAuth = vi.hoisted(() => vi.fn());
vi.mock('../../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

import { AuthScreen } from '../AuthScreen';

const mockRequestOtp = vi.fn();
const mockSignInWithEmail = vi.fn();
const mockVerifyOtp = vi.fn();
const mockCancelOtp = vi.fn();

const defaultAuthContext = {
  requestOtp: mockRequestOtp,
  verifyOtp: mockVerifyOtp,
  cancelOtp: mockCancelOtp,
  signInWithEmail: mockSignInWithEmail,
  authStatus: 'anonymous' as const,
  authError: null,
  authLoading: false,
  pendingPhone: '',
  user: null,
  logout: vi.fn(),
  isAuthenticated: false,
  isInitializing: false,
  setUser: vi.fn(),
  isSupabaseConfigured: true,
};

describe('AuthScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ ...defaultAuthContext });
  });

  it('renders phone mode by default', () => {
    render(<AuthScreen />);
    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/телефон/i)).toBeInTheDocument();
    expect(screen.getByText('Получить код')).toBeInTheDocument();
  });

  it('shows mode toggle buttons', () => {
    render(<AuthScreen />);
    // Use role selector to distinguish toggle button from the phone input label
    expect(screen.getByRole('button', { name: /телефон/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument();
  });

  it('switches to email mode on toggle click', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByText('Email'));

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/пароль/i)).toBeInTheDocument();
    expect(screen.getByText('Войти')).toBeInTheDocument();
  });

  it('switches back to phone mode from email mode', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByText('Email'));
    await user.click(screen.getByText('Телефон'));

    expect(screen.getByLabelText(/имя/i)).toBeInTheDocument();
    expect(screen.getByText('Получить код')).toBeInTheDocument();
  });

  it('submit button disabled when phone fields are empty', () => {
    render(<AuthScreen />);
    const btn = screen.getByText('Получить код').closest('button')!;
    expect(btn).toBeDisabled();
  });

  it('calls signInWithEmail on email form submit', async () => {
    mockSignInWithEmail.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByText('Email'));
    await user.type(screen.getByLabelText(/email/i), 'test@test.com');
    await user.type(screen.getByLabelText(/пароль/i), 'secret123');
    await user.click(screen.getByText('Войти'));

    await waitFor(() => {
      expect(mockSignInWithEmail).toHaveBeenCalledWith('test@test.com', 'secret123');
    });
  });

  it('email submit button disabled when fields empty', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByText('Email'));

    const btn = screen.getByText('Войти').closest('button')!;
    expect(btn).toBeDisabled();
  });

  it('shows authError message', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthContext, authError: 'Неверный email или пароль.' });
    render(<AuthScreen />);
    expect(screen.getByText('Неверный email или пароль.')).toBeInTheDocument();
  });

  it('shows loading spinner when authLoading=true', async () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthContext, authLoading: true });
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByText('Email'));

    // Button should show spinner (Loader2) — no text
    expect(screen.queryByText('Войти')).not.toBeInTheDocument();
  });

  it('calls requestOtp on phone form submit', async () => {
    mockRequestOtp.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.type(screen.getByLabelText(/имя/i), 'Катя');
    await user.type(screen.getByLabelText(/телефон/i), '+79161234567');

    const btn = screen.getByText('Получить код').closest('button')!;
    expect(btn).not.toBeDisabled();

    fireEvent.submit(btn.closest('form')!);

    await waitFor(() => {
      expect(mockRequestOtp).toHaveBeenCalledWith('Катя', '+79161234567');
    });
  });

  it('shows OTP step when authStatus is otp_sent', () => {
    mockUseAuth.mockReturnValue({
      ...defaultAuthContext,
      authStatus: 'otp_sent',
      pendingPhone: '+79161234567',
    });
    render(<AuthScreen />);

    expect(screen.getByText('Введите код')).toBeInTheDocument();
    expect(screen.getByText(/Отправили SMS на/)).toBeInTheDocument();
    expect(screen.getByText('+79161234567')).toBeInTheDocument();
  });

  it('OTP step has 6 individual inputs', () => {
    mockUseAuth.mockReturnValue({
      ...defaultAuthContext,
      authStatus: 'otp_sent',
      pendingPhone: '+7999',
    });
    render(<AuthScreen />);

    const inputs = screen.getAllByRole('textbox');
    // 6 OTP digits
    expect(inputs.length).toBe(6);
  });

  it('handleBack calls cancelOtp', async () => {
    mockUseAuth.mockReturnValue({
      ...defaultAuthContext,
      authStatus: 'otp_sent',
      pendingPhone: '+7999',
    });
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByText('Изменить номер'));
    expect(mockCancelOtp).toHaveBeenCalled();
  });
});
