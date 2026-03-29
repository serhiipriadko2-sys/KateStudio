import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { useIsAdmin } from '../useIsAdmin';

const { mockGetUser, mockRpc, mockOnAuthStateChange } = vi.hoisted(() => ({
  mockGetUser: vi.fn(),
  mockRpc: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
}));

vi.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
    },
    rpc: mockRpc,
  },
  isSupabaseConfigured: true,
}));

const MOCK_USER = { id: 'user-123', email: 'admin@test.com' };

describe('useIsAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  it('starts with isLoading=true', () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
    mockRpc.mockResolvedValue({ data: false, error: null });

    const { result } = renderHook(() => useIsAdmin());
    expect(result.current.isLoading).toBe(true);
  });

  it('sets isAdmin=false and isLoading=false when no user is found', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

    const { result } = renderHook(() => useIsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('sets isAdmin=true when RPC returns true', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
    mockRpc.mockResolvedValue({ data: true, error: null });

    const { result } = renderHook(() => useIsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.user).toEqual(MOCK_USER);
  });

  it('sets isAdmin=false when RPC returns false', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
    mockRpc.mockResolvedValue({ data: false, error: null });

    const { result } = renderHook(() => useIsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
  });

  it('sets isAdmin=false when RPC errors', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
    mockRpc.mockResolvedValue({ data: null, error: new Error('rpc error') });

    const { result } = renderHook(() => useIsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
  });

  it('sets isAdmin=false when auth.getUser errors', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('auth error') });

    const { result } = renderHook(() => useIsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAdmin).toBe(false);
  });

  it('resets to anonymous when onAuthStateChange fires with no session', async () => {
    mockGetUser.mockResolvedValue({ data: { user: MOCK_USER }, error: null });
    mockRpc.mockResolvedValue({ data: true, error: null });

    let authChangeCallback: (event: string, session: null) => void = () => {};
    mockOnAuthStateChange.mockImplementation((cb: typeof authChangeCallback) => {
      authChangeCallback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    const { result } = renderHook(() => useIsAdmin());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(true);

    act(() => {
      authChangeCallback('SIGNED_OUT', null);
    });

    await waitFor(() => expect(result.current.isAdmin).toBe(false));
    expect(result.current.user).toBeNull();
  });
});
