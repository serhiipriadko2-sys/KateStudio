import { Calendar, Clock, Flame, Share2, TrendingUp, Award } from 'lucide-react';
import React from 'react';
import type { WeeklyRecap as WeeklyRecapType, Achievement } from '../types';
import { cn } from '../utils';

export interface WeeklyRecapProps {
  recap: WeeklyRecapType | null;
  isLoading?: boolean;
  onShare?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function WeeklyRecap({
  recap,
  isLoading = false,
  onShare,
  onDismiss,
  className = '',
}: WeeklyRecapProps) {
  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-2xl p-6 shadow-lg animate-pulse', className)}>
        <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-16 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!recap) {
    return null;
  }

  const { dateRange, practiceStats, streakStatus, aiUsage, newAchievements, insights } = recap;

  return (
    <div
      className={cn(
        'bg-gradient-to-br from-brand-green/5 via-brand-mint/10 to-brand-yellow/5',
        'rounded-2xl p-6 shadow-lg border border-brand-green/20',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-green" />
            Итоги недели
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {dateRange.start} — {dateRange.end}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Закрыть"
          >
            ×
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* Practices */}
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-brand-dark">{practiceStats.total}</p>
          <p className="text-xs text-gray-500">практик</p>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-brand-dark">{practiceStats.totalDuration}</p>
          <p className="text-xs text-gray-500">минут</p>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Flame className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-brand-dark">{streakStatus.currentStreak}</p>
          <p className="text-xs text-gray-500">дней streak</p>
        </div>
      </div>

      {/* Streak Status */}
      {streakStatus.maintained ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <p className="text-green-800 text-sm font-medium">
            🔥 Отлично! Вы поддержали streak на этой неделе ({streakStatus.daysThisWeek} дней)
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
          <p className="text-yellow-800 text-sm font-medium">
            💪 Попробуйте практиковать чаще на следующей неделе для поддержания streak
          </p>
        </div>
      )}

      {/* AI Usage */}
      {(aiUsage.chatMessages > 0 || aiUsage.visionAnalyses > 0 || aiUsage.meditations > 0) && (
        <div className="bg-purple-50 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium text-purple-800 mb-2">🤖 AI-активность</h3>
          <div className="flex gap-4 text-sm text-purple-700">
            {aiUsage.chatMessages > 0 && <span>💬 {aiUsage.chatMessages} сообщений</span>}
            {aiUsage.visionAnalyses > 0 && <span>📸 {aiUsage.visionAnalyses} анализов</span>}
            {aiUsage.meditations > 0 && <span>🧘 {aiUsage.meditations} медитаций</span>}
          </div>
        </div>
      )}

      {/* New Achievements */}
      {newAchievements.length > 0 && (
        <div className="bg-yellow-50 rounded-xl p-4 mb-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Новые достижения
          </h3>
          <div className="flex flex-wrap gap-2">
            {newAchievements.map((achievement: Achievement) => (
              <span
                key={achievement.id}
                className="bg-white px-3 py-1 rounded-full text-sm shadow-sm"
              >
                {achievement.icon} {achievement.nameRu}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-sm font-medium text-brand-dark mb-2">✨ Инсайты от Aria</h3>
        <p className="text-sm text-gray-600 mb-2">{insights.summary}</p>
        {insights.improvement && (
          <p className="text-sm text-green-600">📈 {insights.improvement}</p>
        )}
        {insights.recommendation && (
          <p className="text-sm text-blue-600 mt-2">💡 {insights.recommendation}</p>
        )}
      </div>

      {/* Share Button */}
      {onShare && (
        <button
          onClick={onShare}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-brand-green text-white py-3 px-4 rounded-xl hover:bg-brand-green/90 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span>Поделиться результатами</span>
        </button>
      )}
    </div>
  );
}

export default WeeklyRecap;
