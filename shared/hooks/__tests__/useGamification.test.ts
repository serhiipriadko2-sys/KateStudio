import { renderHook, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';

const { mockFrom, mockRpc } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockRpc: vi.fn(),
}));

vi.mock('../../services/supabase', () => ({
  supabase: {
    from: mockFrom,
    rpc: mockRpc,
  },
}));

import { useGamification } from '../useGamification';

function makeFromBuilder(overrides: Record<string, unknown> = {}) {
  const builder: Record<string, unknown> = {
    select: vi.fn(),
    insert: vi.fn().mockResolvedValue({ error: null }),
    eq: vi.fn(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };
  (builder.select as Mock).mockReturnValue(builder);
  (builder.eq as Mock).mockReturnValue(builder);
  return builder;
}

describe('useGamification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts with default values and isLoading=false when no userId', async () => {
    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currentStreak).toBe(0);
    expect(result.current.totalXP).toBe(0);
    expect(result.current.level).toBe(1);
  });

  it('loads cached values from localStorage', async () => {
    localStorage.setItem(
      'ksebe_user_progress',
      JSON.stringify({ currentStreak: 5, maxStreak: 10, totalXP: 200, level: 3 })
    );

    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.currentStreak).toBe(5));

    expect(result.current.totalXP).toBe(200);
    expect(result.current.level).toBe(3);
  });

  it('loads data from Supabase when userId is provided', async () => {
    const progressData = {
      current_streak: 7,
      max_streak: 15,
      total_xp: 350,
      level: 4,
    };
    mockFrom.mockReturnValue(
      makeFromBuilder({ single: vi.fn().mockResolvedValue({ data: progressData, error: null }) })
    );

    const { result } = renderHook(() => useGamification('user-123'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.currentStreak).toBe(7);
    expect(result.current.totalXP).toBe(350);
    expect(result.current.level).toBe(4);
  });

  it('inserts default row when no progress row exists (PGRST116)', async () => {
    mockFrom.mockReturnValue(
      makeFromBuilder({
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'row not found' },
        }),
      })
    );

    const { result } = renderHook(() => useGamification('new-user'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Should have attempted to insert a default row
    expect(mockFrom).toHaveBeenCalledWith('user_progress');
  });

  it('updateStreak calls RPC and updates state', async () => {
    mockFrom.mockReturnValue(
      makeFromBuilder({
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      })
    );
    mockRpc.mockResolvedValue({
      data: { current_streak: 3, max_streak: 5, total_xp: 30, level: 1 },
      error: null,
    });

    const { result } = renderHook(() => useGamification('user-abc'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateStreak();
    });

    expect(mockRpc).toHaveBeenCalledWith('process_practice_completion');
    expect(result.current.currentStreak).toBe(3);
  });

  it('addXP calls RPC and updates state', async () => {
    mockFrom.mockReturnValue(
      makeFromBuilder({
        single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
      })
    );
    mockRpc.mockResolvedValue({
      data: { current_streak: 0, max_streak: 0, total_xp: 10, level: 1 },
      error: null,
    });

    const { result } = renderHook(() => useGamification('user-xyz'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.addXP(10);
    });

    expect(result.current.totalXP).toBe(10);
  });

  it('updateStreak is no-op when no userId', async () => {
    const { result } = renderHook(() => useGamification());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateStreak();
    });

    expect(mockRpc).not.toHaveBeenCalled();
  });
});
