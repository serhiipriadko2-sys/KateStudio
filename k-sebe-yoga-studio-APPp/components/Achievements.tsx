import { Star, TrendingUp, Award } from 'lucide-react';
import React, { useState } from 'react';
import {
  AchievementsGrid,
  AchievementUnlockedModal,
  useAchievements,
  useGamification,
} from '@ksebe/shared';
import type { Achievement, AchievementCategory } from '@ksebe/shared';
import { useAuth } from '../context/AuthContext';

const CATEGORY_TABS: { id: AchievementCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'streak', label: 'Серии' },
  { id: 'practice', label: 'Практика' },
  { id: 'ai', label: 'AI' },
  { id: 'milestone', label: 'Вехи' },
];

const XP_PER_LEVEL = 100;

export const Achievements: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<AchievementCategory | 'all'>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const { level, totalXP, currentStreak, isLoading: progressLoading } = useGamification(user?.id);

  const {
    achievements,
    unlockedCount,
    totalCount,
    overallProgress,
    isLoading: achievementsLoading,
  } = useAchievements({ userId: user?.id });

  const xpInLevel = totalXP % XP_PER_LEVEL;
  const xpPercent = Math.min(100, Math.max(0, xpInLevel));

  if (progressLoading || achievementsLoading) {
    return (
      <div className="p-6 text-center text-stone-400 text-sm animate-pulse">
        Загрузка достижений...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100">
        {/* Level & XP row */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-serif text-brand-text">Мой Прогресс</h3>
            <p className="text-sm text-stone-400">Уровень {level}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-serif text-brand-green">{totalXP}</span>
            <span className="text-xs text-stone-400 uppercase ml-1">XP</span>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden mb-2">
          <div
            className="absolute top-0 left-0 h-full bg-brand-green transition-all duration-1000 ease-out rounded-full"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 mb-4">
          {xpInLevel} / {XP_PER_LEVEL} XP до уровня {level + 1}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-brand-mint/30 rounded-2xl p-3 text-center">
            <TrendingUp className="w-5 h-5 text-brand-green mx-auto mb-1" />
            <span className="block text-lg font-serif text-brand-text">{currentStreak}</span>
            <span className="block text-[10px] text-stone-400 uppercase tracking-wide">Серия</span>
          </div>
          <div className="bg-brand-mint/30 rounded-2xl p-3 text-center">
            <Award className="w-5 h-5 text-brand-green mx-auto mb-1" />
            <span className="block text-lg font-serif text-brand-text">{unlockedCount}</span>
            <span className="block text-[10px] text-stone-400 uppercase tracking-wide">
              Открыто
            </span>
          </div>
          <div className="bg-brand-mint/30 rounded-2xl p-3 text-center">
            <Star className="w-5 h-5 text-brand-green mx-auto mb-1" />
            <span className="block text-lg font-serif text-brand-text">
              {Math.round(overallProgress)}%
            </span>
            <span className="block text-[10px] text-stone-400 uppercase tracking-wide">
              Прогресс
            </span>
          </div>
        </div>
      </div>

      {/* Achievements Card */}
      <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-serif text-brand-text">Достижения</h3>
          <span className="text-sm text-stone-400">
            {unlockedCount} / {totalCount}
          </span>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-green text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AchievementsGrid
          achievements={achievements}
          filterCategory={activeTab === 'all' ? undefined : activeTab}
          onSelect={setSelectedAchievement}
          showProgress
          showLocked
        />
      </div>

      {/* Detail Modal */}
      <AchievementUnlockedModal
        achievement={selectedAchievement}
        isOpen={selectedAchievement !== null}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
};
