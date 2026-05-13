import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

// Use vi.hoisted so all mock functions are available inside vi.mock factories
const {
  mockSignInWithPassword,
  mockSignUp,
  mockVerifyOtp,
  mockSignOut,
  mockGetSession,
  mockGetUser,
  mockOnAuthStateChange,
  mockGetUser2,
  mockRegisterUser,
  mockLogout,
} = vi.hoisted(() => ({
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
  mockVerifyOtp: vi.fn(),
  mockSignOut: vi.fn(),
  mockGetSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  mockGetUser: vi.fn().mockResolvedValue({ data: { user: null } }),
  mockOnAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
  mockGetUser2: vi.fn().mockResolvedValue(null),
  mockRegisterUser: vi.fn().mockResolvedValue({ id: 'u1', name: 'Test', phone: null }),
  mockLogout: vi.fn(),
}));

vi.mock('@ksebe/shared', () => ({
  isSupabaseConfigured: true,
  getSupabasePasswordPolicyMessage: vi.fn().mockReturnValue(null),
  supabase: {
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      verifyOtp: mockVerifyOtp,
      signOut: mockSignOut,
      onAuthStateChange: mockOnAuthStateChange,
    },
  },
}));

vi.mock('../../services/dataService', () => ({
  dataService: {
    getUser: mockGetUser2,
    registerUser: mockRegisterUser,
    logout: mockLogout,
  },
}));

vi.mock('../../services/retentionService', () => ({
  retentionService: {
    bootstrapForUser: vi.fn().mockResolvedValue(undefined),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockGetUser2.mockResolvedValue(null);
  });

  it('initial state: anonymous, not authenticated', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.isInitializing).toBe(false));

    expect(result.current.authStatus).toBe('anonymous');
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  describe('signIn', () => {
    it('calls signInWithPassword with trimmed email', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.signIn('  test@test.com  ', 'password123', 'email');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('calls signInWithPassword with normalized phone', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.signIn('79161234567', 'password123', 'phone');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        phone: '+79161234567',
        password: 'password123',
      });
    });

    it('sets authError on failure', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: new Error('Invalid credentials') });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        try {
          await result.current.signIn('test@test.com', 'wrong', 'email');
        } catch {
          // expected
        }
      });

      expect(result.current.authError).toBe('Неверный логин или пароль. Попробуйте ещё раз.');
    });

    it('clears authError before attempt', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      mockSignInWithPassword.mockResolvedValueOnce({ error: new Error('bad') });
      await act(async () => {
        try {
          await result.current.signIn('x@x.com', 'y', 'email');
        } catch {
          /* */
        }
      });
      expect(result.current.authError).not.toBeNull();

      mockSignInWithPassword.mockResolvedValue({ error: null });
      await act(async () => {
        await result.current.signIn('x@x.com', 'correct', 'email');
      });
      expect(result.current.authError).toBeNull();
    });

    it('throws when supabase returns error', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: new Error('fail') });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await expect(
        act(async () => {
          await result.current.signIn('x@x.com', 'bad', 'email');
        })
      ).rejects.toThrow();
    });
  });

  describe('signUp', () => {
    it('phone: calls signUp and sets phone_otp_sent', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.signUp('Катя', '+79161234567', 'pass123', 'phone');
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        phone: '+79161234567',
        password: 'pass123',
        options: { data: { name: 'Катя' } },
      });
      expect(result.current.authStatus).toBe('phone_otp_sent');
      expect(result.current.pendingPhone).toBe('+79161234567');
    });

    it('phone: normalizes phone without +', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.signUp('Катя', '79161234567', 'pass123', 'phone');
      });

      expect(mockSignUp).toHaveBeenCalledWith(expect.objectContaining({ phone: '+79161234567' }));
    });

    it('email: calls signUp and sets email_unverified', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.signUp('Катя', 'katya@test.com', 'pass123', 'email');
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'katya@test.com',
        password: 'pass123',
        options: { data: { name: 'Катя' } },
      });
      expect(result.current.authStatus).toBe('email_unverified');
    });

    it('phone: sets error on failure and resets to anonymous', async () => {
      mockSignUp.mockResolvedValue({ error: new Error('Rate limited') });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        try {
          await result.current.signUp('Катя', '+79161234567', 'pass', 'phone');
        } catch {
          /* */
        }
      });

      expect(result.current.authError).toBeTruthy();
      expect(result.current.authStatus).toBe('anonymous');
    });

    it('email: sets error on failure and resets to anonymous', async () => {
      mockSignUp.mockResolvedValue({ error: new Error('Email taken') });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        try {
          await result.current.signUp('Катя', 'x@x.com', 'pass', 'email');
        } catch {
          /* */
        }
      });

      expect(result.current.authError).toBeTruthy();
      expect(result.current.authStatus).toBe('anonymous');
    });
  });

  describe('verifyPhoneRegistration', () => {
    it('sets error when called without pendingPhone', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.verifyPhoneRegistration('123456');
      });

      expect(result.current.authError).toBeTruthy();
    });

    it('sets authenticated status on success', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      mockVerifyOtp.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });
      mockRegisterUser.mockResolvedValue({ id: 'user-1', name: 'Катя', phone: '+79161234567' });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.signUp('Катя', '+79161234567', 'pass123', 'phone');
      });

      await act(async () => {
        await result.current.verifyPhoneRegistration('123456');
      });

      expect(result.current.authStatus).toBe('authenticated');
      expect(result.current.user).not.toBeNull();
    });

    it('sets error on failure and keeps phone_otp_sent status', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      mockVerifyOtp.mockResolvedValue({ data: {}, error: new Error('Invalid OTP') });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.signUp('Катя', '+79161234567', 'pass123', 'phone');
      });

      await act(async () => {
        try {
          await result.current.verifyPhoneRegistration('000000');
        } catch {
          /* expected */
        }
      });

      expect(result.current.authError).toBeTruthy();
      expect(result.current.authStatus).toBe('phone_otp_sent');
    });
  });

  describe('cancelPhoneVerification', () => {
    it('resets to anonymous state', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.signUp('Катя', '+79161234567', 'pass123', 'phone');
      });
      expect(result.current.authStatus).toBe('phone_otp_sent');

      act(() => {
        result.current.cancelPhoneVerification();
      });

      expect(result.current.authStatus).toBe('anonymous');
      expect(result.current.pendingPhone).toBe('');
    });
  });

  describe('logout', () => {
    it('calls signOut and resets user', async () => {
      mockSignOut.mockResolvedValue({});
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      act(() => {
        result.current.logout();
      });

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockLogout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.authStatus).toBe('anonymous');
    });
  });
});