import { Award, Calendar, Flame, Target, TrendingUp } from 'lucide-react';
import React from 'react';
import type { StreakData, WeeklyPracticeStats } from '../types';

export interface ProgressSummaryProps {
  streakData?: StreakData;
  weeklyStats?: WeeklyPracticeStats;
  achievementsUnlocked?: number;
  totalAchievements?: number;
  className?: string;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
  color?: string;
}

const colorClasses: Record<string, string> = {
  'brand-green': 'bg-green-100',
  orange: 'bg-orange-100',
  blue: 'bg-blue-100',
  green: 'bg-green-100',
  purple: 'bg-purple-100',
};

function StatCard({ icon, label, value, subValue, color = 'brand-green' }: StatCardProps) {
  const bgClass = colorClasses[color] || 'bg-gray-100';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgClass}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 truncate">{label}</p>
          <p className="text-xl font-bold text-brand-dark">{value}</p>
          {subValue && <p className="text-xs text-gray-400">{subValue}</p>}
        </div>
      </div>
    </div>
  );
}

export function ProgressSummary({
  streakData,
  weeklyStats,
  achievementsUnlocked = 0,
  totalAchievements = 0,
  className = '',
}: ProgressSummaryProps) {
  const achievementProgress =
    totalAchievements > 0 ? Math.round((achievementsUnlocked / totalAchievements) * 100) : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-brand-dark flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-green" />
          Ваш прогресс
        </h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current Streak */}
        {streakData && (
          <StatCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            label="Текущая серия"
            value={`${streakData.currentStreak} дн.`}
            subValue={`Лучшая: ${streakData.longestStreak} дн.`}
            color="orange"
          />
        )}

        {/* Weekly Progress */}
        {streakData && (
          <StatCard
            icon={<Calendar className="w-5 h-5 text-blue-500" />}
            label="На этой неделе"
            value={`${streakData.weeklyProgress}/${streakData.weeklyGoal}`}
            subValue="дней практики"
            color="blue"
          />
        )}

        {/* Total Practices */}
        {streakData && (
          <StatCard
            icon={<Target className="w-5 h-5 text-green-500" />}
            label="Всего практик"
            value={streakData.totalPractices}
            color="green"
          />
        )}

        {/* Achievements */}
        <StatCard
          icon={<Award className="w-5 h-5 text-purple-500" />}
          label="Достижения"
          value={`${achievementsUnlocked}/${totalAchievements}`}
          subValue={`${achievementProgress}%`}
          color="purple"
        />
      </div>

      {/* Weekly Stats Detail */}
      {weeklyStats && weeklyStats.total > 0 && (
        <div className="bg-gradient-to-br from-brand-green/5 to-brand-mint/10 rounded-xl p-4">
          <h3 className="text-sm font-medium text-brand-dark mb-3">Статистика недели</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-2xl font-bold text-brand-green">{weeklyStats.total}</p>
              <p className="text-xs text-gray-500">практик</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-green">{weeklyStats.totalDuration}</p>
              <p className="text-xs text-gray-500">минут</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-green">
                {Math.round(weeklyStats.avgDuration)}
              </p>
              <p className="text-xs text-gray-500">мин/сеанс</p>
            </div>
          </div>

          {/* Practice Types Breakdown */}
          {Object.keys(weeklyStats.types).length > 0 && (
            <div className="mt-3 pt-3 border-t border-brand-green/10">
              <p className="text-xs text-gray-500 mb-2">По типам:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(weeklyStats.types).map(([type, count]) => (
                  <span
                    key={type}
                    className="text-xs px-2 py-1 bg-white rounded-full text-gray-600"
                  >
                    {type}: {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Motivation Message */}
      {streakData && streakData.currentStreak > 0 && (
        <div className="bg-brand-yellow/10 rounded-xl p-4 text-center">
          <p className="text-sm text-brand-dark">
            {streakData.currentStreak >= 7
              ? '🔥 Отличная работа! Продолжайте в том же духе!'
              : streakData.currentStreak >= 3
                ? '💪 Хорошее начало! Ещё немного до недельной серии!'
                : '🌱 Каждый день — это шаг к цели. Продолжайте!'}
          </p>
        </div>
      )}

      {/* Empty State */}
      {(!streakData || streakData.totalPractices === 0) && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-600 mb-1">Начните свой путь</h3>
          <p className="text-sm text-gray-500">
            Завершите первую практику, чтобы начать отслеживать прогресс
          </p>
        </div>
      )}
    </div>
  );
}

export default ProgressSummary;
