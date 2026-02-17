import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { DBUserProgress } from '../types';

export interface UseGamificationReturn {
  currentStreak: number;
  maxStreak: number;
  totalXP: number;
  level: number;
  updateStreak: () => void;
  addXP: (amount: number) => void;
  isLoading: boolean;
}

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

export function useGamification(userId?: string): UseGamificationReturn {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Load from local storage initially
  useEffect(() => {
    const cached = localStorage.getItem('ksebe_user_progress');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCurrentStreak(parsed.currentStreak || 0);
        setMaxStreak(parsed.maxStreak || 0);
        setTotalXP(parsed.totalXP || 0);
        setLevel(parsed.level || 1);
      } catch {
        // Ignore
      }
    }
  }, []);

  // Sync from DB
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Row not found"

        if (data) {
          setCurrentStreak(data.current_streak);
          setMaxStreak(data.max_streak);
          setTotalXP(data.total_xp);
          setLevel(data.level);

          localStorage.setItem('ksebe_user_progress', JSON.stringify({
            currentStreak: data.current_streak,
            maxStreak: data.max_streak,
            totalXP: data.total_xp,
            level: data.level
          }));
        } else {
          // Initialize if not exists
          await supabase.from('user_progress').insert({ user_id: userId });
        }
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  const syncToCloud = useCallback(async (updates: Partial<DBUserProgress>) => {
    if (!userId) return;
    try {
      await supabase
        .from('user_progress')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId);
    } catch {
      // Ignore
    }
  }, [userId]);

  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = localStorage.getItem('ksebe_last_activity');

    if (lastActivity === today) return; // Already updated today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = currentStreak;
    if (lastActivity === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset or start
    }

    const newMax = Math.max(newStreak, maxStreak);

    setCurrentStreak(newStreak);
    setMaxStreak(newMax);
    localStorage.setItem('ksebe_last_activity', today);
    localStorage.setItem('ksebe_user_progress', JSON.stringify({
      currentStreak: newStreak,
      maxStreak: newMax,
      totalXP,
      level
    }));

    syncToCloud({
      current_streak: newStreak,
      max_streak: newMax,
      last_activity_date: today
    });
  }, [currentStreak, maxStreak, totalXP, level, syncToCloud]);

  const addXP = useCallback((amount: number) => {
    const newXP = totalXP + amount;

    // Calculate new level
    let newLevel = level;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (newXP >= LEVEL_THRESHOLDS[i]) {
        newLevel = i + 1;
        break;
      }
    }

    setTotalXP(newXP);
    setLevel(newLevel);

    localStorage.setItem('ksebe_user_progress', JSON.stringify({
      currentStreak,
      maxStreak,
      totalXP: newXP,
      level: newLevel
    }));

    syncToCloud({
      total_xp: newXP,
      level: newLevel
    });
  }, [totalXP, level, currentStreak, maxStreak, syncToCloud]);

  return {
    currentStreak,
    maxStreak,
    totalXP,
    level,
    updateStreak,
    addXP,
    isLoading,
  };
}
