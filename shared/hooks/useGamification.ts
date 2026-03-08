import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

export interface UseGamificationReturn {
  currentStreak: number;
  maxStreak: number;
  totalXP: number;
  level: number;
  updateStreak: () => void;
  addXP: (amount: number) => void;
  isLoading: boolean;
}

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

          localStorage.setItem(
            'ksebe_user_progress',
            JSON.stringify({
              currentStreak: data.current_streak,
              maxStreak: data.max_streak,
              totalXP: data.total_xp,
              level: data.level,
            })
          );
        } else {
          // Initialize a fresh row with default values
          await supabase.from('user_progress').insert({
            user_id: userId,
            total_xp: 0,
            level: 1,
            current_streak: 0,
            max_streak: 0,
          });
        }
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [userId]);

  // updateStreak: delegates to the server-side RPC so calculations cannot be
  // tampered with on the client.
  const updateStreak = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('process_practice_completion');
      if (error) throw error;

      const result = data as {
        total_xp: number;
        level: number;
        current_streak: number;
        max_streak: number;
      };

      setCurrentStreak(result.current_streak);
      setMaxStreak(result.max_streak);
      setTotalXP(result.total_xp);
      setLevel(result.level);

      localStorage.setItem(
        'ksebe_user_progress',
        JSON.stringify({
          currentStreak: result.current_streak,
          maxStreak: result.max_streak,
          totalXP: result.total_xp,
          level: result.level,
        })
      );
    } catch (err) {
      // Silent fail — optimistic local state is kept as-is
      console.error('Failed to update streak via RPC:', err);
    }
  }, [userId]);

  // addXP: also delegates to the RPC. The `amount` parameter is kept for
  // API compatibility but the actual XP increment (+10) is enforced server-side.
  const addXP = useCallback(
    async (_amount: number) => {
      if (!userId) return;

      try {
        const { data, error } = await supabase.rpc('process_practice_completion');
        if (error) throw error;

        const result = data as {
          total_xp: number;
          level: number;
          current_streak: number;
          max_streak: number;
        };

        setTotalXP(result.total_xp);
        setLevel(result.level);
        setCurrentStreak(result.current_streak);
        setMaxStreak(result.max_streak);

        localStorage.setItem(
          'ksebe_user_progress',
          JSON.stringify({
            currentStreak: result.current_streak,
            maxStreak: result.max_streak,
            totalXP: result.total_xp,
            level: result.level,
          })
        );
      } catch (err) {
        // Silent fail
        console.error('Failed to add XP via RPC:', err);
      }
    },
    [userId]
  );

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
