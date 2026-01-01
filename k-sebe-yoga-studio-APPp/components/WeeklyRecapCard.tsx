import { CalendarCheck, Sparkles } from 'lucide-react';
import React, { useMemo } from 'react';
import { usePracticeCompletions } from '../hooks/usePracticeCompletions';
import { useStreak } from '../hooks/useStreak';
import { countPracticeInWeek, formatWeekLabel } from '../utils/practiceLog';
import type { OnboardingData } from './OnboardingQuizModal';

function readOnboarding(): OnboardingData | null {
  try {
    const raw = localStorage.getItem('ksebe_onboarding');
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingData;
  } catch {
    return null;
  }
}

export const WeeklyRecapCard: React.FC = () => {
  const streak = useStreak();
  const practice = usePracticeCompletions();

  const onboarding = useMemo(() => readOnboarding(), []);
  const weekLabel = useMemo(() => formatWeekLabel(), []);

  const weeklyCount = useMemo(() => countPracticeInWeek(practice.days), [practice.days]);

  const estimatedMinutes = onboarding?.minutes ? onboarding.minutes * weeklyCount : undefined;

  const summary = weeklyCount
    ? `На этой неделе у тебя ${weeklyCount} ${
        weeklyCount === 1 ? 'практика' : weeklyCount < 5 ? 'практики' : 'практик'
      }.`
    : 'Неделя только началась — выбери практику и отметь её после завершения.';

  return (
    <div className="px-4 mt-4">
      <div className="rounded-[2.5rem] border border-stone-100 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-stone-500">
                <Sparkles className="w-5 h-5 text-brand-green" />
                <span className="text-xs font-bold uppercase tracking-widest">Weekly recap</span>
              </div>
              <div className="mt-2 text-xl font-serif text-brand-text">{weekLabel}</div>
              <p className="mt-2 text-xs text-stone-500">{summary}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-brand-mint/40 flex items-center justify-center text-brand-green">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-center">
            <div className="rounded-2xl bg-stone-50 border border-stone-100 px-3 py-3">
              <div className="text-2xl font-serif text-brand-text">{weeklyCount}</div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider">Практик</div>
            </div>
            <div className="rounded-2xl bg-stone-50 border border-stone-100 px-3 py-3">
              <div className="text-2xl font-serif text-brand-text">{streak.currentStreak}</div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider">Серия</div>
            </div>
            <div className="rounded-2xl bg-stone-50 border border-stone-100 px-3 py-3">
              <div className="text-2xl font-serif text-brand-text">{estimatedMinutes ?? '—'}</div>
              <div className="text-[11px] text-stone-400 uppercase tracking-wider">Минут</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
