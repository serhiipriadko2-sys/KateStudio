import { Play, Clock, Sparkles, ChevronRight } from 'lucide-react';
import React from 'react';
import type { DailyRecommendationData as DailyRecommendationType, PracticeType } from '../types';

export interface DailyRecommendationProps {
  recommendation: DailyRecommendationType | null;
  isLoading?: boolean;
  onStart?: (practiceId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

const practiceTypeLabels: Record<PracticeType, { label: string; icon: string; color: string }> = {
  'inside-flow': { label: 'Inside Flow', icon: '🎵', color: 'bg-purple-100 text-purple-800' },
  hatha: { label: 'Хатха йога', icon: '🧘', color: 'bg-green-100 text-green-800' },
  meditation: { label: 'Медитация', icon: '🕊️', color: 'bg-blue-100 text-blue-800' },
  breathwork: { label: 'Дыхание', icon: '💨', color: 'bg-teal-100 text-teal-800' },
};

export function DailyRecommendation({
  recommendation,
  isLoading = false,
  onStart,
  onRefresh,
  className = '',
}: DailyRecommendationProps) {
  if (isLoading) {
    return (
      <div
        className={`bg-gradient-to-br from-brand-green/10 to-brand-mint/20 rounded-2xl p-6 animate-pulse ${className}`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div
        className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center ${className}`}
      >
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">Рекомендация дня</h3>
        <p className="text-gray-500 text-sm mb-4">Aria подготовит для вас персональную практику</p>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green/90 transition-colors"
          >
            Получить рекомендацию
          </button>
        )}
      </div>
    );
  }

  const practiceInfo = practiceTypeLabels[recommendation.type];

  return (
    <div
      className={`bg-gradient-to-br from-brand-green/10 via-brand-mint/10 to-brand-yellow/10 rounded-2xl p-6 shadow-sm border border-brand-green/20 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-green" />
          <span className="text-sm font-medium text-brand-green">Практика дня от Aria</span>
        </div>
        {recommendation.matchScore > 0 && (
          <span className="text-xs bg-brand-green/10 text-brand-green px-2 py-1 rounded-full">
            {recommendation.matchScore}% match
          </span>
        )}
      </div>

      {/* Practice Type Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2 py-1 rounded-full ${practiceInfo.color}`}>
          {practiceInfo.icon} {practiceInfo.label}
        </span>
        <span className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {recommendation.duration} мин
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-brand-dark mb-2">{recommendation.title}</h3>

      {/* AI Reason */}
      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{recommendation.reason}</p>

      {/* Music Mood (if available) */}
      {recommendation.musicMood && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <span className="text-lg">🎶</span>
          <span>Настроение: {recommendation.musicMood}</span>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onStart?.(recommendation.practiceId)}
        className="w-full flex items-center justify-center gap-2 bg-brand-green text-white py-3 px-4 rounded-xl hover:bg-brand-green/90 transition-colors group"
      >
        <Play className="w-5 h-5" />
        <span className="font-medium">Начать практику</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Refresh Option */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="w-full mt-2 text-sm text-gray-500 hover:text-brand-green transition-colors"
        >
          Показать другую рекомендацию
        </button>
      )}
    </div>
  );
}

export default DailyRecommendation;
