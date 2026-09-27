import { useLocalStorage } from '@ksebe/shared';
import { Camera, Check, Gift, Leaf, RotateCcw, Sparkles } from 'lucide-react';
import { useMemo } from 'react';
import { SEO } from './SEO';

interface TrackerState {
  releaseHabit: string;
  refillRitual: string;
  completedDays: number[];
}

interface RewardTier {
  threshold: number;
  label: string;
  description: string;
}

const STORAGE_KEY = 'ksebe-30-days-lightness-v1';

const INITIAL_STATE: TrackerState = {
  releaseHabit: '',
  refillRitual: '',
  completedDays: [],
};

const REWARDS: RewardTier[] = [
  {
    threshold: 150,
    label: 'Скидка 10%',
    description: 'На разовое занятие или покупку / продление абонемента.',
  },
  {
    threshold: 220,
    label: 'Скидка 15% + подарок',
    description: 'На абонемент и приятный подарок от студии.',
  },
  {
    threshold: 270,
    label: 'Скидка 20%',
    description: 'На все услуги студии: йога, растяжка, пилатес, медитации и массажи.',
  },
];

export const getRewardTier = (points: number): RewardTier | null => {
  return [...REWARDS].reverse().find((reward) => points >= reward.threshold) ?? null;
};

export const LightnessTracker = () => {
  const [state, setState, resetState] = useLocalStorage<TrackerState>(STORAGE_KEY, INITIAL_STATE);

  const completedDays = useMemo(
    () => [...new Set(state.completedDays.filter((day) => day >= 1 && day <= 30))].sort((a, b) => a - b),
    [state.completedDays]
  );

  const completedCount = completedDays.length;
  const points = completedCount * 10;
  const progress = Math.round((completedCount / 30) * 100);
  const currentReward = getRewardTier(points);
  const nextReward = REWARDS.find((reward) => points < reward.threshold) ?? null;

  const updateText = (field: 'releaseHabit' | 'refillRitual', value: string) => {
    setState((previous) => ({ ...previous, [field]: value }));
  };

  const toggleDay = (day: number) => {
    setState((previous) => {
      const exists = previous.completedDays.includes(day);
      const nextCompleted = exists
        ? previous.completedDays.filter((item) => item !== day)
        : [...previous.completedDays, day].sort((a, b) => a - b);

      return {
        ...previous,
        completedDays: nextCompleted,
      };
    });
  };

  const handleReset = () => {
    if (window.confirm('Сбросить весь прогресс и начать заново?')) {
      resetState();
    }
  };

  return (
    <>
      <SEO
        title="30 дней в лёгкости"
        description="Игровой трекер привычек студии «К себе»: 30 дней мягких изменений, заботы о себе и маленьких шагов."
        url="/30-days"
      />

      <section className="relative overflow-hidden bg-brand-dark text-white pt-32 pb-20 px-6 md:px-12 rounded-b-[3rem]">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-green/25 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-brand-mint/15 blur-3xl" />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-brand-mint mb-6">
            К себе · мягкий челлендж
          </p>
          <h1 className="font-serif text-5xl md:text-7xl leading-[0.95] mb-6">
            30 дней
            <span className="block italic text-brand-mint">в лёгкости</span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/75 text-base md:text-lg font-light leading-relaxed">
            Бережно к телу. С любовью к себе. Без жести, гонки и идеальности.
          </p>
        </div>
      </section>

      <section className="bg-brand-light px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="block bg-white rounded-[2rem] border border-stone-200/80 p-6 md:p-8 shadow-sm">
              <span className="flex items-center gap-3 text-brand-dark mb-4">
                <span className="w-10 h-10 rounded-full bg-brand-mint/40 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-brand-green" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.22em] text-brand-green font-semibold">
                    1. Отпускаю
                  </span>
                  <span className="font-serif text-xl">Одну привычку, от которой устала</span>
                </span>
              </span>
              <textarea
                value={state.releaseHabit}
                onChange={(event) => updateText('releaseHabit', event.target.value)}
                maxLength={180}
                rows={3}
                placeholder="Например: залипание в телефоне перед сном…"
                className="w-full resize-none rounded-2xl bg-stone-50 border border-stone-200 px-4 py-4 text-brand-text placeholder:text-stone-400 focus:outline-none focus:border-brand-green"
              />
            </label>

            <label className="block bg-white rounded-[2rem] border border-stone-200/80 p-6 md:p-8 shadow-sm">
              <span className="flex items-center gap-3 text-brand-dark mb-4">
                <span className="w-10 h-10 rounded-full bg-brand-accent/60 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.22em] text-brand-green font-semibold">
                    2. Наполняю
                  </span>
                  <span className="font-serif text-xl">15 минут в кайф — только для себя</span>
                </span>
              </span>
              <textarea
                value={state.refillRitual}
                onChange={(event) => updateText('refillRitual', event.target.value)}
                maxLength={180}
                rows={3}
                placeholder="Например: чай в тишине, прогулка, растяжка, книга…"
                className="w-full resize-none rounded-2xl bg-stone-50 border border-stone-200 px-4 py-4 text-brand-text placeholder:text-stone-400 focus:outline-none focus:border-brand-green"
              />
            </label>
          </div>

          <div className="bg-white rounded-[2rem] border border-stone-200/80 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-brand-green font-semibold mb-2">
                  Мой путь
                </p>
                <h2 className="font-serif text-3xl md:text-4xl text-brand-dark">
                  Отмечай каждый сделанный день
                </h2>
              </div>
              <div className="text-left md:text-right">
                <p className="text-2xl font-serif text-brand-dark">{completedCount} / 30</p>
                <p className="text-sm text-stone-500">{points} / 300 баллов</p>
              </div>
            </div>

            <div className="h-2 bg-stone-100 rounded-full overflow-hidden mb-8" aria-hidden="true">
              <div
                className="h-full bg-brand-green rounded-full transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-3">
              {Array.from({ length: 30 }, (_, index) => {
                const day = index + 1;
                const isCompleted = completedDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={isCompleted}
                    aria-label={`День ${day}, ${isCompleted ? 'выполнен' : 'не отмечен'}`}
                    onClick={() => toggleDay(day)}
                    className={`
                      aspect-square rounded-full border text-sm font-semibold transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2
                      ${
                        isCompleted
                          ? 'bg-brand-green text-white border-brand-green shadow-md scale-[1.04]'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-brand-green hover:text-brand-green'
                      }
                    `}
                  >
                    {isCompleted ? <Check className="w-4 h-4 mx-auto" aria-hidden="true" /> : day}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl bg-brand-mint/20 border border-brand-mint/40 px-5 py-4 text-sm text-brand-text">
              <strong className="text-brand-dark">Как отмечать:</strong> нажми на кружок сегодняшнего
              дня. Он станет изумрудным, а тебе автоматически добавится 10 баллов.
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
            <div className="bg-white rounded-[2rem] border border-stone-200/80 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-10 rounded-full bg-brand-accent/60 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-amber-600" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-brand-green font-semibold">
                    Бонусы студии
                  </p>
                  <h2 className="font-serif text-2xl text-brand-dark">Твои награды</h2>
                </div>
              </div>

              <div className="space-y-3">
                {REWARDS.map((reward) => {
                  const unlocked = points >= reward.threshold;

                  return (
                    <div
                      key={reward.threshold}
                      className={`rounded-2xl border p-4 transition-colors ${
                        unlocked
                          ? 'border-brand-green bg-brand-mint/20'
                          : 'border-stone-200 bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <p className="font-semibold text-brand-dark">{reward.label}</p>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            unlocked
                              ? 'bg-brand-green text-white'
                              : 'bg-white text-stone-500 border border-stone-200'
                          }`}
                        >
                          от {reward.threshold}
                        </span>
                      </div>
                      <p className="text-sm text-stone-500 leading-relaxed">{reward.description}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-sm text-stone-500">
                {currentReward ? (
                  <p>
                    Уже доступно: <strong className="text-brand-green">{currentReward.label}</strong>.
                    Продолжай в своём ритме 🤍
                  </p>
                ) : nextReward ? (
                  <p>
                    До первой награды осталось{' '}
                    <strong className="text-brand-dark">{nextReward.threshold - points} баллов</strong>.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="bg-brand-dark text-white rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-green/20 blur-2xl" />
              <div className="relative z-10">
                <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-5">
                  <Camera className="w-5 h-5 text-brand-mint" />
                </span>
                <p className="text-xs uppercase tracking-[0.22em] text-brand-mint font-semibold mb-2">
                  Правило игры
                </p>
                <h2 className="font-serif text-3xl mb-4">Фотоотчёт — это поддержка</h2>
                <p className="text-white/70 leading-relaxed mb-5">
                  Стакан воды, коврик, галочка в блокноте, свеча или просто селфи с улыбкой — любая
                  маленькая деталь дня подойдёт.
                </p>
                <p className="text-white/90 text-sm">
                  Щёлкнула → отправила в чат → получила сердечки → забрала свои баллы.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center py-6">
            <p className="font-serif italic text-2xl md:text-3xl text-brand-dark max-w-3xl mx-auto leading-relaxed">
              «Идеально делать ничего не надо. Мы здесь не для того, чтобы себя ломать».
            </p>
            <p className="mt-5 text-sm text-stone-400">
              Прогресс сохраняется только на этом устройстве и в этом браузере.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-6 inline-flex items-center gap-2 text-sm text-stone-400 hover:text-brand-green transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Начать заново
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
