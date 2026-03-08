import { supabase } from '@ksebe/shared';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  condition: (progress: UserProgress, stats: UserStats) => boolean;
}

export interface UserProgress {
  user_id: string;
  current_streak: number;
  max_streak: number;
  total_xp: number;
  level: number;
}

export interface UserStats {
  practices_completed: number;
  streak_days: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'Первые шаги',
    description: 'Завершите первую практику',
    icon: 'Footprints',
    condition: (_, stats) => stats.practices_completed >= 1,
  },
  {
    id: 'week_warrior',
    title: 'Неделя побед',
    description: 'Стрик 7 дней подряд',
    icon: 'Flame',
    condition: (_, stats) => stats.streak_days >= 7,
  },
  {
    id: 'dedicated_yogi',
    title: 'Преданный йог',
    description: '30 дней практики подряд',
    icon: 'Trophy',
    condition: (_, stats) => stats.streak_days >= 30,
  },
  {
    id: 'level_5',
    title: 'Продвинутый',
    description: 'Достигните 5 уровня',
    icon: 'Star',
    condition: (progress) => progress.level >= 5,
  },
];

export const gamificationService = {
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is 'not found'
      console.error('Error fetching user progress:', error);
      return null;
    }

    if (!data) {
      // Initialize if not exists
      const initial: UserProgress = {
        user_id: userId,
        current_streak: 0,
        max_streak: 0,
        total_xp: 0,
        level: 1,
      };
      // We don't await this to keep UI fast, but in a real app we might want to
      await supabase.from('user_progress').insert(initial);
      return initial;
    }

    return data as UserProgress;
  },

  async getUnlockedAchievements(userId: string): Promise<string[]> {
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    return data ? data.map((row: { achievement_id: string }) => row.achievement_id) : [];
  },

  async processActivity(
    userId: string,
    type: 'practice_completed'
  ): Promise<{
    newXp: number;
    newLevel: number;
    unlocked: Achievement[];
  }> {
    if (type !== 'practice_completed') {
      throw new Error(`Unsupported activity type: ${type}`);
    }

    // Delegate XP and streak calculation to the secure server-side RPC.
    // This prevents client-side tampering with progress values.
    const { data, error } = await supabase.rpc('process_practice_completion');

    if (error) {
      console.error('Error processing practice completion:', error);
      throw new Error('Could not process practice completion');
    }

    const rpcResult = data as {
      total_xp: number;
      level: number;
      current_streak: number;
      max_streak: number;
    };

    // Check Achievements using the authoritative values returned by the RPC.
    const { count } = await supabase
      .from('practice_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('kind', 'completion');

    const stats: UserStats = {
      practices_completed: (count || 0) + 1, // +1 for the current one
      streak_days: rpcResult.current_streak,
    };

    const unlockedIds = await this.getUnlockedAchievements(userId);
    const newlyUnlocked: Achievement[] = [];

    const nextProgress: UserProgress = {
      user_id: userId,
      total_xp: rpcResult.total_xp,
      level: rpcResult.level,
      current_streak: rpcResult.current_streak,
      max_streak: 0, // not needed for achievement conditions
    };

    for (const ach of ACHIEVEMENTS) {
      if (!unlockedIds.includes(ach.id)) {
        if (ach.condition(nextProgress, stats)) {
          newlyUnlocked.push(ach);
          await supabase.from('user_achievements').insert({
            user_id: userId,
            achievement_id: ach.id,
            unlocked_at: new Date().toISOString(),
          });
        }
      }
    }

    return {
      newXp: rpcResult.total_xp,
      newLevel: rpcResult.level,
      unlocked: newlyUnlocked,
    };
  },
};
