import { useState, useCallback, useEffect } from 'react';
import { ACHIEVEMENTS } from '../constants';
import type { Achievement, AchievementCategory, AchievementRarity } from '../types';

export interface UseAchievementsOptions {
  /**
   * Storage key for persisting achievements
   */
  storageKey?: string;
  /**
   * Callback when achievement is unlocked
   */
  onUnlock?: (achievement: Achievement) => void;
}

export interface UseAchievementsReturn {
  /**
   * All achievements with current progress
   */
  achievements: Achievement[];
  /**
   * Unlocked achievements only
   */
  unlockedAchievements: Achievement[];
  /**
   * Locked achievements only
   */
  lockedAchievements: Achievement[];
  /**
   * Most recently unlocked achievement (for modal)
   */
  recentUnlock: Achievement | null;
  /**
   * Clear recent unlock (after showing modal)
   */
  clearRecentUnlock: () => void;
  /**
   * Update progress for an achievement
   */
  updateProgress: (achievementId: string, progress: number) => void;
  /**
   * Increment progress for an achievement
   */
  incrementProgress: (achievementId: string, amount?: number) => void;
  /**
   * Check if achievement should be unlocked based on current progress
   */
  checkUnlock: (achievementId: string) => boolean;
  /**
   * Get achievements by category
   */
  getByCategory: (category: AchievementCategory) => Achievement[];
  /**
   * Get achievements by rarity
   */
  getByRarity: (rarity: AchievementRarity) => Achievement[];
  /**
   * Calculate overall progress percentage
   */
  overallProgress: number;
  /**
   * Total achievements count
   */
  totalCount: number;
  /**
   * Unlocked achievements count
   */
  unlockedCount: number;
}

const DEFAULT_STORAGE_KEY = 'ksebe_achievements';

/**
 * Hook for managing user achievements and gamification
 */
export function useAchievements(options: UseAchievementsOptions = {}): UseAchievementsReturn {
  const { storageKey = DEFAULT_STORAGE_KEY, onUnlock } = options;

  // Initialize achievements with progress from storage
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<
          string,
          { progress: number; unlocked: boolean; unlockedAt?: string }
        >;
        return ACHIEVEMENTS.map((ach) => ({
          ...ach,
          progress: parsed[ach.id]?.progress ?? 0,
          unlocked: parsed[ach.id]?.unlocked ?? false,
          unlockedAt: parsed[ach.id]?.unlockedAt,
        }));
      }
    } catch {
      // Ignore storage errors
    }
    return ACHIEVEMENTS.map((ach) => ({
      ...ach,
      progress: 0,
      unlocked: false,
    }));
  });

  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      const data = achievements.reduce(
        (acc, ach) => {
          acc[ach.id] = {
            progress: ach.progress,
            unlocked: ach.unlocked,
            unlockedAt: ach.unlockedAt,
          };
          return acc;
        },
        {} as Record<string, { progress: number; unlocked: boolean; unlockedAt?: string }>
      );
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      // Ignore storage errors
    }
  }, [achievements, storageKey]);

  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);

  const clearRecentUnlock = useCallback(() => {
    setRecentUnlock(null);
  }, []);

  const updateProgress = useCallback(
    (achievementId: string, progress: number) => {
      setAchievements((prev) =>
        prev.map((ach) => {
          if (ach.id !== achievementId) return ach;

          const newProgress = Math.min(progress, ach.target);
          const shouldUnlock = newProgress >= ach.target && !ach.unlocked;

          const updated: Achievement = {
            ...ach,
            progress: newProgress,
            unlocked: shouldUnlock ? true : ach.unlocked,
            unlockedAt: shouldUnlock ? new Date().toISOString() : ach.unlockedAt,
          };

          if (shouldUnlock) {
            setRecentUnlock(updated);
            onUnlock?.(updated);
          }

          return updated;
        })
      );
    },
    [onUnlock]
  );

  const incrementProgress = useCallback(
    (achievementId: string, amount: number = 1) => {
      setAchievements((prev) =>
        prev.map((ach) => {
          if (ach.id !== achievementId) return ach;

          const newProgress = Math.min(ach.progress + amount, ach.target);
          const shouldUnlock = newProgress >= ach.target && !ach.unlocked;

          const updated: Achievement = {
            ...ach,
            progress: newProgress,
            unlocked: shouldUnlock ? true : ach.unlocked,
            unlockedAt: shouldUnlock ? new Date().toISOString() : ach.unlockedAt,
          };

          if (shouldUnlock) {
            setRecentUnlock(updated);
            onUnlock?.(updated);
          }

          return updated;
        })
      );
    },
    [onUnlock]
  );

  const checkUnlock = useCallback(
    (achievementId: string): boolean => {
      const achievement = achievements.find((a) => a.id === achievementId);
      return achievement ? achievement.progress >= achievement.target : false;
    },
    [achievements]
  );

  const getByCategory = useCallback(
    (category: AchievementCategory): Achievement[] => {
      return achievements.filter((a) => a.category === category);
    },
    [achievements]
  );

  const getByRarity = useCallback(
    (rarity: AchievementRarity): Achievement[] => {
      return achievements.filter((a) => a.rarity === rarity);
    },
    [achievements]
  );

  const totalCount = achievements.length;
  const unlockedCount = unlockedAchievements.length;
  const overallProgress = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return {
    achievements,
    unlockedAchievements,
    lockedAchievements,
    recentUnlock,
    clearRecentUnlock,
    updateProgress,
    incrementProgress,
    checkUnlock,
    getByCategory,
    getByRarity,
    overallProgress,
    totalCount,
    unlockedCount,
  };
}

export default useAchievements;
