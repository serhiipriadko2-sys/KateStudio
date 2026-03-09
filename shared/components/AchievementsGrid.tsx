import { Lock, Star } from 'lucide-react';
import type { Achievement, AchievementCategory, AchievementRarity } from '../types';
import { cn } from '../utils';

export interface AchievementsGridProps {
  achievements: Achievement[];
  onSelect?: (achievement: Achievement) => void;
  showProgress?: boolean;
  showLocked?: boolean;
  filterCategory?: AchievementCategory;
  className?: string;
}

const rarityColors: Record<AchievementRarity, string> = {
  common: 'from-gray-100 to-gray-200 border-gray-300',
  rare: 'from-blue-50 to-blue-100 border-blue-300',
  epic: 'from-purple-50 to-purple-100 border-purple-300',
  legendary: 'from-yellow-50 to-amber-100 border-yellow-400',
};

const rarityBadgeColors: Record<AchievementRarity, string> = {
  common: 'bg-gray-200 text-gray-700',
  rare: 'bg-blue-200 text-blue-800',
  epic: 'bg-purple-200 text-purple-800',
  legendary: 'bg-yellow-200 text-yellow-800',
};

const categoryLabels: Record<AchievementCategory, string> = {
  streak: 'Серия',
  practice: 'Практика',
  ai: 'AI',
  community: 'Сообщество',
  milestone: 'Веха',
};

export function AchievementsGrid({
  achievements,
  onSelect,
  showProgress = true,
  showLocked = true,
  filterCategory,
  className = '',
}: AchievementsGridProps) {
  const filteredAchievements = filterCategory
    ? achievements.filter((a) => a.category === filterCategory)
    : achievements;

  const visibleAchievements = showLocked
    ? filteredAchievements
    : filteredAchievements.filter((a) => a.unlocked);

  if (visibleAchievements.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">Нет достижений в этой категории</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 ${className}`}>
      {visibleAchievements.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          showProgress={showProgress}
          onClick={() => onSelect?.(achievement)}
        />
      ))}
    </div>
  );
}

interface AchievementCardProps {
  achievement: Achievement;
  showProgress?: boolean;
  onClick?: () => void;
}

function AchievementCard({ achievement, showProgress, onClick }: AchievementCardProps) {
  const { unlocked, icon, nameRu, rarity, progress, target, category } = achievement;
  const progressPercent = Math.min((progress / target) * 100, 100);

  const buttonClasses = cn(
    'relative p-4 rounded-xl border-2 transition-all duration-200 bg-gradient-to-br',
    rarityColors[rarity],
    unlocked ? 'opacity-100 hover:scale-105' : 'opacity-60 grayscale hover:grayscale-0',
    onClick ? 'cursor-pointer' : 'cursor-default'
  );

  return (
    <button onClick={onClick} className={buttonClasses}>
      {/* Lock overlay for locked achievements */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl">
          <Lock className="w-6 h-6 text-gray-500" />
        </div>
      )}

      {/* Rarity indicator */}
      {rarity === 'legendary' && unlocked && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" />
      )}

      {/* Icon */}
      <div className="text-4xl text-center mb-2">{icon}</div>

      {/* Name */}
      <h4
        className={`text-sm font-semibold text-center mb-1 truncate ${
          unlocked ? 'text-brand-dark' : 'text-gray-500'
        }`}
      >
        {nameRu}
      </h4>

      {/* Category badge */}
      <div className="flex justify-center mb-2">
        <span className={`text-xs px-2 py-0.5 rounded-full ${rarityBadgeColors[rarity]}`}>
          {categoryLabels[category]}
        </span>
      </div>

      {/* Progress bar */}
      {showProgress && !unlocked && (
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-brand-green h-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Progress text */}
      {showProgress && !unlocked && (
        <p className="text-xs text-gray-500 text-center mt-1">
          {progress}/{target}
        </p>
      )}

      {/* Unlocked checkmark */}
      {unlocked && (
        <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </button>
  );
}

