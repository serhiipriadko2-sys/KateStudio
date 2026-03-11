import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Use vi.hoisted so all mock functions are available inside vi.mock factories
const {
  mockSignInWithPassword,
  mockSignInWithOtp,
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
  mockSignInWithOtp: vi.fn(),
  mockVerifyOtp: vi.fn(),
  mockSignOut: vi.fn(),
  mockGetSession: vi.fn().mockResolvedValue({ data: { session: null } }),
  mockGetUser: vi.fn().mockResolvedValue({ data: { user: null } }),
  mockOnAuthStateChange: vi.fn().mockReturnValue({
    data: { subscription: { unsubscribe: vi.fn() } },
  }),
  mockGetUser2: vi.fn().mockResolvedValue(null),
  mockRegisterUser: vi.fn().mockResolvedValue({ id: 'u1', name: 'Test', phone: '' }),
  mockLogout: vi.fn(),
}));

vi.mock('@ksebe/shared', () => ({
  isSupabaseConfigured: true,
  supabase: {
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
      signInWithPassword: mockSignInWithPassword,
      signInWithOtp: mockSignInWithOtp,
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

import { AuthProvider, useAuth } from '../AuthContext';

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

  describe('signInWithEmail', () => {
    it('calls supabase.auth.signInWithPassword with trimmed email', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.signInWithEmail('  test@test.com  ', 'password123');
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('sets authError on failure', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: new Error('Invalid credentials') });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        try {
          await result.current.signInWithEmail('test@test.com', 'wrong');
        } catch {
          // expected
        }
      });

      expect(result.current.authError).toBe('Неверный email или пароль. Попробуйте ещё раз.');
    });

    it('clears authError before attempt', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      // First: set an error
      mockSignInWithPassword.mockResolvedValueOnce({ error: new Error('bad') });
      await act(async () => {
        try {
          await result.current.signInWithEmail('x@x.com', 'y');
        } catch {
          /* */
        }
      });
      expect(result.current.authError).not.toBeNull();

      // Second attempt succeeds — error should clear
      mockSignInWithPassword.mockResolvedValue({ error: null });
      await act(async () => {
        await result.current.signInWithEmail('x@x.com', 'correct');
      });
      expect(result.current.authError).toBeNull();
    });

    it('throws when supabase returns error', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: new Error('fail') });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await expect(
        act(async () => {
          await result.current.signInWithEmail('x@x.com', 'bad');
        })
      ).rejects.toThrow();
    });
  });

  describe('requestOtp', () => {
    it('calls supabase.auth.signInWithOtp with normalized phone', async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.requestOtp('Катя', '+79161234567');
      });

      expect(mockSignInWithOtp).toHaveBeenCalledWith({
        phone: '+79161234567',
        options: { shouldCreateUser: true },
      });
      expect(result.current.authStatus).toBe('otp_sent');
    });

    it('sets error state on OTP failure', async () => {
      mockSignInWithOtp.mockResolvedValue({ error: new Error('Rate limited') });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        try {
          await result.current.requestOtp('Катя', '+79161234567');
        } catch {
          /* */
        }
      });

      expect(result.current.authError).toBeTruthy();
      expect(result.current.authStatus).toBe('anonymous');
    });
  });

  describe('cancelOtp', () => {
    it('resets to anonymous state', async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.requestOtp('Катя', '+79161234567');
      });
      expect(result.current.authStatus).toBe('otp_sent');

      act(() => {
        result.current.cancelOtp();
      });
      expect(result.current.authStatus).toBe('anonymous');
      expect(result.current.pendingPhone).toBe('');
    });
  });

  describe('logout', () => {
    it('calls supabase.auth.signOut and resets user', async () => {
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

  describe('verifyOtp', () => {
    it('sets error when called without pendingPhone', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.verifyOtp('123456');
      });

      expect(result.current.authError).toBeTruthy();
    });

    it('sets authenticated status on success', async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null });
      mockVerifyOtp.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      mockGetSession.mockResolvedValue({
        data: { session: { user: { id: 'user-1' } } },
      });
      mockRegisterUser.mockResolvedValue({ id: 'user-1', name: 'Катя', phone: '+79161234567' });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      // First set pendingPhone via requestOtp
      await act(async () => {
        await result.current.requestOtp('Катя', '+79161234567');
      });

      await act(async () => {
        await result.current.verifyOtp('123456');
      });

      expect(result.current.authStatus).toBe('authenticated');
      expect(result.current.user).not.toBeNull();
    });

    it('sets error on verifyOtp failure and keeps otp_sent status', async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null });
      mockVerifyOtp.mockResolvedValue({ data: {}, error: new Error('Invalid OTP') });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.requestOtp('Катя', '+79161234567');
      });

      await act(async () => {
        try {
          await result.current.verifyOtp('000000');
        } catch {
          /* expected */
        }
      });

      expect(result.current.authError).toBeTruthy();
      expect(result.current.authStatus).toBe('otp_sent');
    });
  });

  describe('pendingPhone', () => {
    it('exposed in context', async () => {
      mockSignInWithOtp.mockResolvedValue({ error: null });
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isInitializing).toBe(false));

      await act(async () => {
        await result.current.requestOtp('Катя', '+79161234567');
      });

      expect(result.current.pendingPhone).toBe('+79161234567');
    });
  });
});
