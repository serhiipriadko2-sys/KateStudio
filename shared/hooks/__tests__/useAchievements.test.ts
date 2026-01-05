import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAchievements } from '../useAchievements';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useAchievements', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with all achievements at zero progress', () => {
    const { result } = renderHook(() => useAchievements());

    expect(result.current.achievements.length).toBeGreaterThan(0);
    expect(result.current.unlockedCount).toBe(0);
    expect(result.current.overallProgress).toBe(0);
  });

  it('should update progress for an achievement', () => {
    const { result } = renderHook(() => useAchievements());

    act(() => {
      result.current.updateProgress('first_practice', 1);
    });

    const achievement = result.current.achievements.find((a) => a.id === 'first_practice');
    expect(achievement?.progress).toBe(1);
  });

  it('should unlock achievement when target is reached', () => {
    const { result } = renderHook(() => useAchievements());

    act(() => {
      result.current.updateProgress('first_practice', 1);
    });

    const achievement = result.current.achievements.find((a) => a.id === 'first_practice');
    expect(achievement?.unlocked).toBe(true);
    expect(result.current.unlockedCount).toBe(1);
  });

  it('should set recentUnlock when achievement is unlocked', () => {
    const { result } = renderHook(() => useAchievements());

    expect(result.current.recentUnlock).toBeNull();

    act(() => {
      result.current.updateProgress('first_practice', 1);
    });

    expect(result.current.recentUnlock).not.toBeNull();
    expect(result.current.recentUnlock?.id).toBe('first_practice');
  });

  it('should clear recentUnlock when clearRecentUnlock is called', () => {
    const { result } = renderHook(() => useAchievements());

    act(() => {
      result.current.updateProgress('first_practice', 1);
    });

    expect(result.current.recentUnlock).not.toBeNull();

    act(() => {
      result.current.clearRecentUnlock();
    });

    expect(result.current.recentUnlock).toBeNull();
  });

  it('should increment progress correctly', () => {
    const { result } = renderHook(() => useAchievements());

    act(() => {
      result.current.incrementProgress('streak_7', 3);
    });

    const achievement = result.current.achievements.find((a) => a.id === 'streak_7');
    expect(achievement?.progress).toBe(3);

    act(() => {
      result.current.incrementProgress('streak_7', 2);
    });

    const updatedAchievement = result.current.achievements.find((a) => a.id === 'streak_7');
    expect(updatedAchievement?.progress).toBe(5);
  });

  it('should not exceed target when incrementing', () => {
    const { result } = renderHook(() => useAchievements());

    act(() => {
      result.current.incrementProgress('first_practice', 100);
    });

    const achievement = result.current.achievements.find((a) => a.id === 'first_practice');
    expect(achievement?.progress).toBe(1); // target is 1
  });

  it('should call onUnlock callback when achievement is unlocked', () => {
    const onUnlock = vi.fn();
    const { result } = renderHook(() => useAchievements({ onUnlock }));

    act(() => {
      result.current.updateProgress('first_practice', 1);
    });

    expect(onUnlock).toHaveBeenCalledTimes(1);
    expect(onUnlock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'first_practice',
        unlocked: true,
      })
    );
  });

  it('should filter achievements by category', () => {
    const { result } = renderHook(() => useAchievements());

    const streakAchievements = result.current.getByCategory('streak');
    const aiAchievements = result.current.getByCategory('ai');

    expect(streakAchievements.every((a) => a.category === 'streak')).toBe(true);
    expect(aiAchievements.every((a) => a.category === 'ai')).toBe(true);
  });

  it('should filter achievements by rarity', () => {
    const { result } = renderHook(() => useAchievements());

    const commonAchievements = result.current.getByRarity('common');
    const legendaryAchievements = result.current.getByRarity('legendary');

    expect(commonAchievements.every((a) => a.rarity === 'common')).toBe(true);
    expect(legendaryAchievements.every((a) => a.rarity === 'legendary')).toBe(true);
  });

  it('should calculate overall progress correctly', () => {
    const { result } = renderHook(() => useAchievements());

    const totalAchievements = result.current.totalCount;

    act(() => {
      result.current.updateProgress('first_practice', 1);
    });

    expect(result.current.unlockedCount).toBe(1);
    expect(result.current.overallProgress).toBeCloseTo((1 / totalAchievements) * 100);
  });

  it('should persist achievements to localStorage', () => {
    const { result } = renderHook(() => useAchievements({ storageKey: 'test_achievements' }));

    act(() => {
      result.current.updateProgress('first_practice', 1);
    });

    expect(localStorageMock.setItem).toHaveBeenCalled();
    const lastCall =
      localStorageMock.setItem.mock.calls[localStorageMock.setItem.mock.calls.length - 1];
    expect(lastCall[0]).toBe('test_achievements');
  });
});
