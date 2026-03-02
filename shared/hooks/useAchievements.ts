import { useState, useCallback, useEffect } from 'react';
import { ACHIEVEMENTS } from '../constants';
import { supabase } from '../services/supabase';
import type {
  Achievement,
  AchievementCategory,
  AchievementRarity,
  DBUserAchievement,
} from '../types';

export interface UseAchievementsOptions {
  /**
   * Storage key for persisting achievements (fallback)
   */
  storageKey?: string;
  /**
   * Callback when achievement is unlocked
   */
  onUnlock?: (achievement: Achievement) => void;
  /**
   * User ID for cloud sync
   */
  userId?: string;
}

export interface UseAchievementsReturn {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
  recentUnlock: Achievement | null;
  clearRecentUnlock: () => void;
  updateProgress: (achievementId: string, progress: number) => void;
  incrementProgress: (achievementId: string, amount?: number) => void;
  checkUnlock: (achievementId: string) => boolean;
  getByCategory: (category: AchievementCategory) => Achievement[];
  getByRarity: (rarity: AchievementRarity) => Achievement[];
  overallProgress: number;
  totalCount: number;
  unlockedCount: number;
  isLoading: boolean;
}

const DEFAULT_STORAGE_KEY = 'ksebe_achievements';

/**
 * Hook for managing user achievements and gamification with Supabase sync
 */
export function useAchievements(options: UseAchievementsOptions = {}): UseAchievementsReturn {
  const { storageKey = DEFAULT_STORAGE_KEY, onUnlock, userId } = options;
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch from Supabase
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchAchievements = async () => {
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', userId);

        if (error) throw error;

        if (data) {
          setAchievements((prev) =>
            prev.map((ach) => {
              const remote = data.find((r: DBUserAchievement) => r.achievement_id === ach.id);
              if (remote) {
                // Merge logic: take max progress/unlocked state
                return {
                  ...ach,
                  progress: Math.max(ach.progress, remote.progress),
                  unlocked: ach.unlocked || !!remote.unlocked_at,
                  unlockedAt: ach.unlockedAt || remote.unlocked_at || undefined,
                };
              }
              return ach;
            })
          );
        }
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, [userId]);

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

  // Sync to Supabase helper
  const syncToCloud = useCallback(
    async (achievement: Achievement) => {
      if (!userId) return;

      try {
        await supabase.from('user_achievements').upsert(
          {
            user_id: userId,
            achievement_id: achievement.id,
            progress: achievement.progress,
            unlocked_at: achievement.unlocked
              ? achievement.unlockedAt || new Date().toISOString()
              : null,
          },
          { onConflict: 'user_id, achievement_id' }
        );
      } catch {
        // console.warn('Failed to save achievement to cloud');
      }
    },
    [userId]
  );

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

          // Don't downgrade progress
          if (progress <= ach.progress) return ach;

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

          // Trigger sync (fire and forget)
          syncToCloud(updated);

          return updated;
        })
      );
    },
    [onUnlock, syncToCloud]
  );

  const incrementProgress = useCallback(
    (achievementId: string, amount: number = 1) => {
      setAchievements((prev) => {
        // Calculate new state first to handle logic outside the map if needed,
        // but map is cleaner for immutable update.
        return prev.map((ach) => {
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

          // Trigger sync
          syncToCloud(updated);

          return updated;
        });
      });
    },
    [onUnlock, syncToCloud]
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
    isLoading,
  };
}
