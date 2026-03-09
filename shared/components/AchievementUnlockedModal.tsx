import { X, Share2, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Achievement, AchievementRarity } from '../types';

export interface AchievementUnlockedModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  onShare?: (achievement: Achievement) => void;
}

const rarityStyles: Record<AchievementRarity, { bg: string; border: string; glow: string }> = {
  common: {
    bg: 'from-gray-100 to-gray-200',
    border: 'border-gray-300',
    glow: '',
  },
  rare: {
    bg: 'from-blue-100 to-blue-200',
    border: 'border-blue-400',
    glow: 'shadow-blue-200',
  },
  epic: {
    bg: 'from-purple-100 to-purple-200',
    border: 'border-purple-400',
    glow: 'shadow-purple-200',
  },
  legendary: {
    bg: 'from-yellow-100 via-amber-100 to-orange-100',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-300',
  },
};

const rarityLabels: Record<AchievementRarity, string> = {
  common: 'Обычное',
  rare: 'Редкое',
  epic: 'Эпическое',
  legendary: 'Легендарное',
};

export function AchievementUnlockedModal({
  achievement,
  isOpen,
  onClose,
  onShare,
}: AchievementUnlockedModalProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && achievement) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, achievement]);

  if (!isOpen || !achievement) return null;

  const styles = rarityStyles[achievement.rarity];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Confetti Effect for Legendary */}
      {achievement.rarity === 'legendary' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#f0c14b', '#57a773', '#ff6b6b', '#4ecdc4', '#ffe66d'][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        className={`
          relative max-w-sm w-full bg-gradient-to-br ${styles.bg} rounded-3xl p-8 
          border-2 ${styles.border} shadow-2xl ${styles.glow}
          ${isAnimating ? 'animate-bounce-in' : ''}
        `}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy Icon */}
        <div className="flex justify-center mb-4">
          <div
            className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${achievement.rarity === 'legendary' ? 'bg-yellow-400 animate-pulse' : 'bg-brand-green/20'}
            `}
          >
            <Trophy
              className={`w-8 h-8 ${
                achievement.rarity === 'legendary' ? 'text-white' : 'text-brand-green'
              }`}
            />
          </div>
        </div>

        {/* Unlocked Text */}
        <p className="text-center text-sm font-medium text-gray-600 mb-2">
          🎉 Достижение разблокировано!
        </p>

        {/* Achievement Icon */}
        <div className="text-6xl text-center mb-4">{achievement.icon}</div>

        {/* Achievement Name */}
        <h2 className="text-2xl font-bold text-center text-brand-dark mb-1">
          {achievement.nameRu}
        </h2>

        <p className="text-sm text-center text-gray-500 mb-4">{achievement.name}</p>

        {/* Rarity Badge */}
        <div className="flex justify-center mb-4">
          <span
            className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${achievement.rarity === 'legendary' ? 'bg-yellow-400 text-yellow-900' : ''}
              ${achievement.rarity === 'epic' ? 'bg-purple-400 text-white' : ''}
              ${achievement.rarity === 'rare' ? 'bg-blue-400 text-white' : ''}
              ${achievement.rarity === 'common' ? 'bg-gray-400 text-white' : ''}
            `}
          >
            ⭐ {rarityLabels[achievement.rarity]}
          </span>
        </div>

        {/* Description */}
        <p className="text-center text-gray-600 mb-6">{achievement.description}</p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors border border-gray-200"
          >
            Отлично!
          </button>
          {onShare && (
            <button
              onClick={() => onShare(achievement)}
              className="flex items-center justify-center gap-2 py-3 px-4 bg-brand-green text-white rounded-xl font-medium hover:bg-brand-green/90 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Поделиться</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

