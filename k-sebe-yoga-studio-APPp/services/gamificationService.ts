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

const XP_PER_LEVEL = 100;
const XP_PER_PRACTICE = 10;

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
    // 1. Get current progress
    const progress = await this.getUserProgress(userId);
    if (!progress) throw new Error('Could not load user progress');

    // 2. Calculate new XP
    let addedXp = 0;
    if (type === 'practice_completed') {
      addedXp = XP_PER_PRACTICE;
    }

    const newTotalXp = progress.total_xp + addedXp;
    const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1;

    // 3. Update DB
    const { error } = await supabase
      .from('user_progress')
      .update({
        total_xp: newTotalXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) console.error('Error updating progress:', error);

    // 4. Check Achievements
    // Need to fetch stats first. Ideally, we calculate stats from 'practice_events' count
    // For now, we use the streak from 'user_progress' (which should be synced by retentionService)
    // and practice count from 'practice_events'

    const { count } = await supabase
      .from('practice_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('kind', 'completion');

    const stats: UserStats = {
      practices_completed: (count || 0) + 1, // +1 for the current one
      streak_days: progress.current_streak, // Assuming this is updated elsewhere or we trust it
    };

    const unlockedIds = await this.getUnlockedAchievements(userId);
    const newlyUnlocked: Achievement[] = [];

    // Temporarily update progress object for condition check
    const nextProgress = { ...progress, total_xp: newTotalXp, level: newLevel };

    for (const ach of ACHIEVEMENTS) {
      if (!unlockedIds.includes(ach.id)) {
        if (ach.condition(nextProgress, stats)) {
          newlyUnlocked.push(ach);
          // Persist
          await supabase.from('user_achievements').insert({
            user_id: userId,
            achievement_id: ach.id,
            unlocked_at: new Date().toISOString(),
          });
        }
      }
    }

    return {
      newXp: newTotalXp,
      newLevel: newLevel,
      unlocked: newlyUnlocked,
    };
  },
};
