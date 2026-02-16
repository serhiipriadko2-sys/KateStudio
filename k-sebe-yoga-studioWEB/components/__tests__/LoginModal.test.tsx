import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginModal } from '../LoginModal';

/* ─── Mock AuthContext ─────────────────────────── */

const mockSignIn = vi.fn();
const mockSignUp = vi.fn();
const mockClearError = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
    authError: null,
    clearError: mockClearError,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    signOut: vi.fn(),
    updateProfile: vi.fn(),
  }),
}));

vi.mock('../../hooks/useScrollLock', () => ({
  useScrollLock: vi.fn(),
}));

vi.mock('../../hooks/useFocusTrap', () => ({
  useFocusTrap: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

/* ─── Tests ───────────────────────────────────── */

describe('LoginModal', () => {
  it('does not render when closed', () => {
    render(<LoginModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders login form when open', () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Вход')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Пароль (мин. 6 символов)')).toBeInTheDocument();
  });

  it('switches to register mode', () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByText('Нет аккаунта? Зарегистрироваться'));
    expect(screen.getByText('Регистрация')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ваше имя')).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль (мин. 6 символов)');

    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Войти'));
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль (мин. 6 символов)');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: '123' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Войти'));
    });

    expect(mockSignIn).not.toHaveBeenCalled();
  });

  it('calls signIn with valid credentials', async () => {
    mockSignIn.mockResolvedValue(undefined);
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Пароль (мин. 6 символов)');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Войти'));
    });

    expect(mockSignIn).toHaveBeenCalledWith('test@test.com', '123456');
  });

  it('calls signUp when in register mode', async () => {
    mockSignUp.mockResolvedValue(undefined);
    render(<LoginModal isOpen={true} onClose={vi.fn()} />);

    // Switch to register
    fireEvent.click(screen.getByText('Нет аккаунта? Зарегистрироваться'));

    fireEvent.change(screen.getByPlaceholderText('Ваше имя'), { target: { value: 'Тест' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Пароль (мин. 6 символов)'), {
      target: { value: '123456' },
    });

    await act(async () => {
      fireEvent.click(screen.getByText('Создать аккаунт'));
    });

    expect(mockSignUp).toHaveBeenCalledWith('test@test.com', '123456', 'Тест');
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<LoginModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Закрыть'));
    expect(onClose).toHaveBeenCalled();
  });
});
