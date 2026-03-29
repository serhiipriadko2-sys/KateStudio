import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthScreen } from '../AuthScreen';

vi.mock('../Logo', () => ({
  Logo: () => <div data-testid="logo" />,
}));

const mockUseAuth = vi.hoisted(() => vi.fn());
vi.mock('../../context/AuthContext', () => ({
  useAuth: mockUseAuth,
}));

const mockSignUp = vi.fn();
const mockSignIn = vi.fn();
const mockVerifyPhoneRegistration = vi.fn();
const mockCancelPhoneVerification = vi.fn();

const defaultAuthContext = {
  signUp: mockSignUp,
  signIn: mockSignIn,
  verifyPhoneRegistration: mockVerifyPhoneRegistration,
  cancelPhoneVerification: mockCancelPhoneVerification,
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

// Helpers
const getSubmitBtn = () => screen.getByTestId('auth-submit');
const getPasswordInput = () => screen.getByLabelText('Пароль', { selector: 'input' });
const getPhoneInput = () => screen.getByLabelText('Телефон', { selector: 'input' });
const getEmailInput = () => screen.getByLabelText('Email', { selector: 'input' });
const getNameInput = () => screen.getByLabelText('Имя', { selector: 'input' });

describe('AuthScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ ...defaultAuthContext });
  });

  it('renders login+phone mode by default', () => {
    render(<AuthScreen />);
    expect(getPhoneInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(getSubmitBtn()).toHaveTextContent('Войти');
    // Name field only on register
    expect(screen.queryByLabelText('Имя', { selector: 'input' })).not.toBeInTheDocument();
  });

  it('shows login/register and phone/email toggles', () => {
    render(<AuthScreen />);
    expect(screen.getByTestId('mode-login')).toBeInTheDocument();
    expect(screen.getByTestId('mode-register')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Телефон/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Email/i })[0]).toBeInTheDocument();
  });

  it('switches to register mode — shows name field and phone+password', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByRole('button', { name: /зарегистрироваться/i }));

    expect(getNameInput()).toBeInTheDocument();
    expect(getPhoneInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(getSubmitBtn()).toHaveTextContent('Получить код');
  });

  it('switches to email mode in login', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByRole('button', { name: /^Email$/i }));

    expect(getEmailInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(screen.queryByLabelText('Имя', { selector: 'input' })).not.toBeInTheDocument();
    expect(getSubmitBtn()).toHaveTextContent('Войти');
  });

  it('switches to email mode in register — shows name field', async () => {
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByRole('button', { name: /зарегистрироваться/i }));
    await user.click(screen.getByRole('button', { name: /^Email$/i }));

    expect(getNameInput()).toBeInTheDocument();
    expect(getEmailInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(getSubmitBtn()).toHaveTextContent('Зарегистрироваться');
  });

  it('submit disabled when login phone fields empty', () => {
    render(<AuthScreen />);
    expect(getSubmitBtn()).toBeDisabled();
  });

  it('calls signIn with email on email login submit', async () => {
    mockSignIn.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByRole('button', { name: /^Email$/i }));
    await user.type(getEmailInput(), 'test@test.com');
    await user.type(getPasswordInput(), 'secret123');
    await user.click(getSubmitBtn());

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@test.com', 'secret123', 'email');
    });
  });

  it('calls signIn with phone on phone login submit', async () => {
    mockSignIn.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.type(getPhoneInput(), '+79161234567');
    await user.type(getPasswordInput(), 'secret123');

    fireEvent.submit(getSubmitBtn().closest('form')!);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('+79161234567', 'secret123', 'phone');
    });
  });

  it('calls signUp with phone on phone register submit', async () => {
    mockSignUp.mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByRole('button', { name: /зарегистрироваться/i }));
    await user.type(getNameInput(), 'Катя');
    await user.type(getPhoneInput(), '+79161234567');
    await user.type(getPasswordInput(), 'secret123');

    fireEvent.submit(getSubmitBtn().closest('form')!);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('Катя', '+79161234567', 'secret123', 'phone');
    });
  });

  it('shows authError message', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthContext, authError: 'Неверный логин или пароль.' });
    render(<AuthScreen />);
    expect(screen.getByText('Неверный логин или пароль.')).toBeInTheDocument();
  });

  it('submit button is disabled when authLoading=true', () => {
    mockUseAuth.mockReturnValue({ ...defaultAuthContext, authLoading: true });
    render(<AuthScreen />);
    expect(getSubmitBtn()).toBeDisabled();
  });

  it('shows OTP step when authStatus is phone_otp_sent', () => {
    mockUseAuth.mockReturnValue({
      ...defaultAuthContext,
      authStatus: 'phone_otp_sent',
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
      authStatus: 'phone_otp_sent',
      pendingPhone: '+7999',
    });
    render(<AuthScreen />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(6);
  });

  it('handleBack calls cancelPhoneVerification', async () => {
    mockUseAuth.mockReturnValue({
      ...defaultAuthContext,
      authStatus: 'phone_otp_sent',
      pendingPhone: '+7999',
    });
    const user = userEvent.setup();
    render(<AuthScreen />);

    await user.click(screen.getByText('Изменить номер'));
    expect(mockCancelPhoneVerification).toHaveBeenCalled();
  });

  it('shows email_sent step when authStatus is email_unverified', () => {
    mockUseAuth.mockReturnValue({
      ...defaultAuthContext,
      authStatus: 'email_unverified',
    });
    render(<AuthScreen />);

    expect(screen.getByText('Проверьте почту')).toBeInTheDocument();
  });
});
