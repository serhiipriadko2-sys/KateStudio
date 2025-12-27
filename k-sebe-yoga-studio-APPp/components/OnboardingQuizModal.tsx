import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';

export type OnboardingData = {
  goal: 'relax' | 'flexibility' | 'strength' | 'inside-flow' | 'breathwork' | 'health';
  level: 'beginner' | 'intermediate' | 'advanced';
  minutes: 10 | 20 | 30 | 45 | 60;
  limitations: string;
  createdAt: string;
};

const GOALS: Array<{ value: OnboardingData['goal']; label: string; hint: string }> = [
  { value: 'relax', label: 'Релакс', hint: 'Снять стресс, выдохнуть' },
  { value: 'flexibility', label: 'Гибкость', hint: 'Больше подвижности и лёгкости' },
  { value: 'strength', label: 'Сила', hint: 'Тонус и выносливость' },
  { value: 'inside-flow', label: 'Inside Flow', hint: 'Поток + музыка + эмоция' },
  { value: 'breathwork', label: 'Дыхание', hint: 'Пранаяма, концентрация, сон' },
  { value: 'health', label: 'Здоровье', hint: 'Мягко, бережно, без спешки' },
];

const LEVELS: Array<{ value: OnboardingData['level']; label: string; hint: string }> = [
  { value: 'beginner', label: 'Новичок', hint: 'Только начинаю' },
  { value: 'intermediate', label: 'Средний', hint: 'Понимаю базу, хочу прогресс' },
  { value: 'advanced', label: 'Продвинутый', hint: 'Регулярная практика' },
];

const MINUTES: Array<{ value: OnboardingData['minutes']; label: string; hint: string }> = [
  { value: 10, label: '10 минут', hint: 'Очень коротко' },
  { value: 20, label: '20 минут', hint: 'Комфортно' },
  { value: 30, label: '30 минут', hint: 'Оптимально' },
  { value: 45, label: '45 минут', hint: 'Глубже' },
  { value: 60, label: '60 минут', hint: 'Полная практика' },
];

function clampStep(step: number): 0 | 1 | 2 | 3 {
  if (step <= 0) return 0;
  if (step >= 3) return 3;
  return step as 0 | 1 | 2 | 3;
}

export const OnboardingQuizModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onComplete: (data: OnboardingData) => void;
}> = ({ open, onClose, onComplete }) => {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [goal, setGoal] = useState<OnboardingData['goal']>('relax');
  const [level, setLevel] = useState<OnboardingData['level']>('beginner');
  const [minutes, setMinutes] = useState<OnboardingData['minutes']>(20);
  const [limitations, setLimitations] = useState('');

  const progress = useMemo(() => ((step + 1) / 4) * 100, [step]);

  if (!open) return null;

  const canNext =
    step === 0 ? Boolean(goal) : step === 1 ? Boolean(level) : step === 2 ? Boolean(minutes) : true;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-stone-100 overflow-hidden">
        <div className="bg-brand-green/95 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/70">ONBOARDING</p>
            <h2 className="font-serif text-lg">Подстроим практику под тебя</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5 opacity-90" />
          </button>
        </div>

        <div className="h-1 bg-stone-100">
          <div
            className="h-1 bg-brand-green transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {step === 0 && (
            <div>
              <h3 className="font-medium text-brand-text mb-3">1/4 — Главная цель</h3>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.value)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      goal === g.value
                        ? 'bg-brand-green text-white border-brand-green shadow-lg'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-brand-green'
                    }`}
                  >
                    <div className="font-medium text-sm">{g.label}</div>
                    <div
                      className={`text-[11px] mt-1 ${goal === g.value ? 'text-white/80' : 'text-stone-400'}`}
                    >
                      {g.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 className="font-medium text-brand-text mb-3">2/4 — Уровень</h3>
              <div className="space-y-3">
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    type="button"
                    onClick={() => setLevel(l.value)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      level === l.value
                        ? 'bg-brand-green text-white border-brand-green shadow-lg'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-brand-green'
                    }`}
                  >
                    <div className="font-medium text-sm">{l.label}</div>
                    <div
                      className={`text-[11px] mt-1 ${level === l.value ? 'text-white/80' : 'text-stone-400'}`}
                    >
                      {l.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-medium text-brand-text mb-3">
                3/4 — Сколько времени обычно есть?
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {MINUTES.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMinutes(m.value)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      minutes === m.value
                        ? 'bg-brand-green text-white border-brand-green shadow-lg'
                        : 'bg-white text-stone-700 border-stone-200 hover:border-brand-green'
                    }`}
                  >
                    <div className="font-medium text-sm">{m.label}</div>
                    <div
                      className={`text-[11px] mt-1 ${minutes === m.value ? 'text-white/80' : 'text-stone-400'}`}
                    >
                      {m.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-medium text-brand-text mb-2">4/4 — Ограничения / пожелания</h3>
              <p className="text-xs text-stone-500 mb-3">
                Например: «поясница», «колени», «беременность», «хочу мягко», «без прыжков».
              </p>
              <label className="sr-only" htmlFor="ksebe-onboarding-limitations">
                Ограничения
              </label>
              <textarea
                id="ksebe-onboarding-limitations"
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green"
                placeholder="Напишите здесь…"
              />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-stone-100 bg-white flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => clampStep(s - 1))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-50 disabled:hover:bg-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Назад
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => clampStep(s + 1))}
              disabled={!canNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm bg-brand-green text-white hover:bg-brand-green/90 disabled:opacity-50 transition-colors"
            >
              Далее
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() =>
                onComplete({
                  goal,
                  level,
                  minutes,
                  limitations: limitations.trim(),
                  createdAt: new Date().toISOString(),
                })
              }
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm bg-brand-green text-white hover:bg-brand-green/90 transition-colors"
            >
              Готово
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
