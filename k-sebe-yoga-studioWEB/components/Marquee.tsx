import React, { useEffect, useState } from 'react';

const INHALE_WORDS = [
  'Свет',
  'Любовь',
  'Энергия',
  'Поток',
  'Вдохновение',
  'Сила',
  'Благодарность',
  'Радость',
  'Надежда',
  'Гармония',
  'Присутствие',
  'Открытость',
];
const EXHALE_WORDS = [
  'Тишина',
  'Покой',
  'Баланс',
  'Мягкость',
  'Отпускание',
  'Принятие',
  'Спокойствие',
  'Лёгкость',
  'Расслабление',
  'Доверие',
  'Тепло',
  'Умиротворение',
];

/**
 * Number of concept words displayed in the strip.
 * Total slots = LABEL / WORD / LABEL / WORD / ... / LABEL
 */
const WORDS_DISPLAYED = 3;
const SLOT_COUNT = WORDS_DISPLAYED * 2 + 1;

/**
 * Subtle, static asymmetry per column (adds organic feel).
 */
const COLUMN_JITTER: Array<{ y: number; r: number }> = [
  { y: -2, r: -0.14 },
  { y: 1, r: 0.12 },
  { y: -1, r: -0.08 },
  { y: 2, r: 0.16 },
  { y: 0, r: -0.06 },
  { y: -1, r: 0.1 },
  { y: 1, r: -0.12 },
];

export const Marquee: React.FC = () => {
  const [isInhale, setIsInhale] = useState(true);
  const [wordOffset, setWordOffset] = useState(0);

  const cycleDurationMs = 5000;
  const transitionDurationMs = 4800;

  useEffect(() => {
    const interval = setInterval(() => {
      setIsInhale((prev) => {
        if (!prev) {
          setWordOffset(
            (offset) => (offset + 1) % Math.max(INHALE_WORDS.length - WORDS_DISPLAYED + 1, 1)
          );
        }
        return !prev;
      });
    }, cycleDurationMs);

    return () => clearInterval(interval);
  }, []);

  const transitionDuration = `${transitionDurationMs}ms`;

  const getRotatedWords = (words: string[]) => {
    const result: string[] = [];
    for (let i = 0; i < WORDS_DISPLAYED; i++) {
      result.push(words[(wordOffset + i) % words.length]);
    }
    return result;
  };

  const renderStrip = (phase: 'inhale' | 'exhale', isActive: boolean) => {
    const label = phase === 'inhale' ? 'Вдох' : 'Выдох';
    const words = phase === 'inhale' ? INHALE_WORDS : EXHALE_WORDS;
    const rotatedWords = getRotatedWords(words);

    return (
      <div
        className={[
          'fog-layer',
          'absolute inset-0 w-full flex justify-between items-center',
          'px-4 md:px-12 max-w-[1400px] mx-auto',
          'transition-[opacity,transform,filter]',
          'ease-[cubic-bezier(0.33,0,0.67,1)]',
          isActive ? 'opacity-100 blur-0 scale-100 z-10' : 'opacity-0 blur-md scale-[0.985] z-0',
        ].join(' ')}
        style={
          {
            transitionDuration,
            ['--fog-dur' as never]: transitionDuration,
          } as React.CSSProperties
        }
      >
        {Array.from({ length: SLOT_COUNT }).map((_, slotIndex) => {
          const isLabelSlot = slotIndex % 2 === 0;
          const wordIndex = Math.floor(slotIndex / 2);
          const text = isLabelSlot ? label : rotatedWords[wordIndex];

          const jitter = COLUMN_JITTER[slotIndex] ?? { y: 0, r: 0 };
          const delayMs = slotIndex * 120;

          return (
            <div
              key={`${phase}-${slotIndex}`}
              className="flex-1 flex justify-center text-center"
              style={{ transform: `translateY(${jitter.y}px) rotate(${jitter.r}deg)` }}
            >
              {isLabelSlot ? (
                <span
                  data-text={label}
                  style={{ ['--fog-delay' as never]: `${delayMs}ms` } as React.CSSProperties}
                  className={[
                    'fog-word',
                    isActive ? 'fog-in' : 'fog-out',
                    'text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] shrink-0',
                    phase === 'inhale'
                      ? 'text-brand-green/75 drop-shadow-[0_0_10px_rgba(87,167,115,0.22)]'
                      : 'text-brand-green/55 drop-shadow-[0_0_8px_rgba(87,167,115,0.12)]',
                    isActive ? 'opacity-100' : 'opacity-0',
                  ].join(' ')}
                >
                  {label}
                </span>
              ) : (
                <span
                  data-text={text}
                  style={{ ['--fog-delay' as never]: `${delayMs}ms` } as React.CSSProperties}
                  className={[
                    'fog-word',
                    isActive ? 'fog-in' : 'fog-out',
                    'text-base sm:text-xl md:text-3xl font-serif italic whitespace-nowrap',
                    phase === 'inhale'
                      ? 'text-brand-text/90 font-normal'
                      : 'text-brand-text/70 font-light',
                  ].join(' ')}
                >
                  {text}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <section className="relative h-32 md:h-48 overflow-hidden flex flex-col justify-center items-center bg-brand-light border-y border-brand-green/5">
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-light to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-light to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none"></div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-5xl h-40 bg-brand-mint/25 blur-[100px] rounded-full transition-all ease-[cubic-bezier(0.33,0,0.67,1)]"
          style={{
            transitionDuration,
            transform: `translate(-50%, -50%) scale(${isInhale ? 1.1 : 0.85})`,
            opacity: isInhale ? 0.4 : 0.15,
          }}
        ></div>
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-brand-green/10 blur-[60px] rounded-full transition-all ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{
            transitionDuration: `${cycleDurationMs * 1.1}ms`,
            transform: `translate(-50%, -50%) scale(${isInhale ? 1.2 : 0.9})`,
            opacity: isInhale ? 0.3 : 0.1,
          }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-20 bg-brand-yellow/15 blur-[50px] rounded-full transition-all ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            transitionDuration: `${cycleDurationMs * 0.9}ms`,
            transform: `translateY(-50%) scale(${isInhale ? 1.15 : 0.8})`,
            opacity: isInhale ? 0.25 : 0.08,
          }}
        ></div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden max-w-[1920px] mx-auto">
        {renderStrip('inhale', isInhale)}
        {renderStrip('exhale', !isInhale)}
      </div>
    </section>
  );
};
