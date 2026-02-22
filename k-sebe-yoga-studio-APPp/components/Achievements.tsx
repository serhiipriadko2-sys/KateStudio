import { Flame, Footprints, Lock, Star, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ACHIEVEMENTS, gamificationService, UserProgress } from '../services/gamificationService';

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  Footprints,
  Flame,
  Trophy,
  Star,
};

export const Achievements: React.FC = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [unlockedIds, setUnlockedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const [prog, unlocked] = await Promise.all([
          gamificationService.getUserProgress(user.id),
          gamificationService.getUnlockedAchievements(user.id),
        ]);
        setProgress(prog);
        setUnlockedIds(unlocked);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (loading) {
    return <div className="p-6 text-center text-stone-400 text-sm">Загрузка достижений...</div>;
  }

  if (!progress) return null;

  const currentLevel = progress.level;
  const xpInCurrentLevel = progress.total_xp % 100; // Assuming 100 XP per level
  const progressPercent = Math.min(100, Math.max(0, xpInCurrentLevel));

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-serif text-brand-text">Мой Прогресс</h3>
          <p className="text-sm text-stone-400">Уровень {currentLevel}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-serif text-brand-green">{progress.total_xp}</span>
          <span className="text-xs text-stone-400 uppercase ml-1">XP</span>
        </div>
      </div>

      {/* Level Progress Bar */}
      <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden mb-8">
        <div
          className="absolute top-0 left-0 h-full bg-brand-green transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-4 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const isUnlocked = unlockedIds.includes(ach.id);
          const Icon = iconMap[ach.icon] || Star;

          return (
            <div key={ach.id} className="flex flex-col items-center text-center gap-2 group">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-brand-mint text-brand-green shadow-lg shadow-brand-green/20 scale-100'
                    : 'bg-stone-50 text-stone-300 scale-95 grayscale'
                }`}
              >
                {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>
              <div className="space-y-0.5">
                <p
                  className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${
                    isUnlocked ? 'text-brand-text' : 'text-stone-300'
                  }`}
                >
                  {ach.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
