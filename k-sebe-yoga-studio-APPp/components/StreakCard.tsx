import { Flame, Sparkles } from 'lucide-react';
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useStreak } from '../hooks/useStreak';
import { retentionService } from '../services/retentionService';

export const StreakCard: React.FC<{ onOpenRecommended?: () => void }> = ({ onOpenRecommended }) => {
  const { authStatus, user } = useAuth();
  const { showToast } = useToast();
  const streak = useStreak();

  useEffect(() => {
    if (!streak.shouldShowReminder) return;
    streak.markReminderShown();
    showToast('Сегодня ещё не было практики. Даже 5 минут — уже победа.', 'info');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streak.shouldShowReminder]);

  return (
    <div className="px-4 mt-6">
      <div className="rounded-[2.5rem] border border-stone-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-stone-500">
              <Flame
                className={`w-5 h-5 ${streak.currentStreak > 0 ? 'text-amber-500' : 'text-stone-300'}`}
              />
              <span className="text-xs font-bold uppercase tracking-widest">Streak</span>
            </div>
            <div className="mt-2 flex items-end gap-3">
              <div className="text-4xl font-serif text-brand-text leading-none">
                {streak.currentStreak}
              </div>
              <div className="pb-1">
                <div className="text-xs text-stone-500">
                  {streak.currentStreak === 1
                    ? 'день'
                    : streak.currentStreak > 1 && streak.currentStreak < 5
                      ? 'дня'
                      : 'дней'}
                </div>
                <div className="text-[11px] text-stone-400">Лучшее: {streak.longestStreak}</div>
              </div>
            </div>
            <div className="mt-3 text-xs text-stone-500">
              {streak.hasToday
                ? 'Практика сегодня отмечена. Так держать!'
                : 'Отметьте практику, когда закончите.'}
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => {
                if (!streak.hasToday) {
                  streak.logToday();
                  showToast('Практика отмечена!', 'success');
                  if (authStatus === 'authenticated' && user?.id) {
                    retentionService.upsertPracticeDay(user.id, streak.today).catch(() => {});
                    retentionService
                      .logEvent(user.id, 'practice_logged', { day: streak.today })
                      .catch(() => {});
                  }
                } else {
                  showToast('Сегодня уже отмечено. Молодец!', 'info');
                }
              }}
              className={`px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                streak.hasToday
                  ? 'bg-stone-100 text-stone-500'
                  : 'bg-brand-green text-white hover:bg-brand-green/90'
              }`}
            >
              {streak.hasToday ? 'Отмечено' : 'Отметить'}
            </button>
            {onOpenRecommended && (
              <button
                onClick={onOpenRecommended}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider border border-stone-200 text-stone-600 hover:border-brand-green hover:text-brand-green transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Подборка
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
