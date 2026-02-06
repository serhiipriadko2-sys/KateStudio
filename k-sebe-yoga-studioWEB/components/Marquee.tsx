import React, { useState, useEffect } from 'react';

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

// Number of words displayed simultaneously in the animation
const WORDS_DISPLAYED = 4;

export const Marquee: React.FC = () => {
  const [isInhale, setIsInhale] = useState(true);
  const [wordOffset, setWordOffset] = useState(0);
  const cycleDuration = 4000;

  useEffect(() => {
    // 4 seconds per phase - coherent breathing rhythm
    const interval = setInterval(() => {
      setIsInhale((prev) => {
        // Rotate words when transitioning from exhale to inhale
        if (!prev) {
          setWordOffset(
            (offset) => (offset + 1) % Math.max(INHALE_WORDS.length - WORDS_DISPLAYED + 1, 1)
          );
        }
        return !prev;
      });
    }, cycleDuration);

    return () => clearInterval(interval);
  }, []);

  const transitionDuration = `${cycleDuration}ms`;

  // Get rotated words (WORDS_DISPLAYED words starting from offset)
  const getRotatedWords = (words: string[]) => {
    const result = [];
    for (let i = 0; i < WORDS_DISPLAYED; i++) {
      result.push(words[(wordOffset + i) % words.length]);
    }
    return result;
  };

  const renderStrip = (words: string[], label: string, isActive: boolean) => {
    const rotatedWords = getRotatedWords(words);
    const wordOffsets = [-6, 4, -3, 5];
    const labelOffsets = [-4, 3, -5, 2];
    return (
      <div
        className={`
          absolute inset-0 flex items-center justify-center w-full relative
          gap-6 sm:gap-12 md:gap-24 px-4
          transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isActive ? 'opacity-100 blur-0 scale-100 z-10' : 'opacity-0 blur-xl scale-105 z-0'}
        `}
        style={{ transitionDuration }}
      >
        <div
          className={`
            absolute inset-0 pointer-events-none transition-all ease-[cubic-bezier(0.33,0,0.67,1)]
            ${isActive ? 'opacity-70' : 'opacity-0'}
          `}
          style={{ transitionDuration }}
        >
          <div className="absolute -left-20 top-1/2 h-24 w-1/2 -translate-y-1/2 rounded-full bg-brand-light/70 blur-[40px]" />
          <div className="absolute right-4 top-1/3 h-16 w-1/3 rounded-full bg-brand-mint/40 blur-[50px]" />
        </div>
        {/* First Label */}
        <span
          className={`
            text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-green/60 shrink-0
            transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isActive ? 'opacity-100' : 'opacity-0'}
          `}
          style={{
            transitionDuration,
            transform: `translateY(${isActive ? labelOffsets[0] : labelOffsets[0] + 6}px)`,
          }}
        >
          {label}
        </span>

        {rotatedWords.map((word, i) => (
          <React.Fragment key={`${wordOffset}-${i}`}>
            {/* Word */}
            <span
              className={`
                text-xl sm:text-2xl md:text-4xl font-serif text-brand-text/90 whitespace-nowrap shrink-0
                transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isActive ? 'tracking-normal opacity-100 blur-0' : 'tracking-[0.35em] opacity-0 blur-[8px]'}
              `}
              style={{
                transitionDuration,
                transitionDelay: isActive ? `${i * 120}ms` : '0ms',
                transform: `translateY(${isActive ? wordOffsets[i] : wordOffsets[i] + 8}px)`,
              }}
            >
              {word}
            </span>

            {/* Label */}
            <span
              className={`
                text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-green/60 shrink-0
                transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isActive ? 'opacity-100' : 'opacity-0'}
              `}
              style={{
                transitionDuration,
                transform: `translateY(${
                  isActive
                    ? labelOffsets[(i + 1) % labelOffsets.length]
                    : labelOffsets[(i + 1) % labelOffsets.length] + 6
                }px)`,
              }}
            >
              {label}
            </span>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <section className="relative h-32 md:h-48 overflow-hidden flex flex-col justify-center items-center bg-brand-light border-y border-brand-green/5">
      {/* --- Gradient Masks for "Weaving" Effect --- */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-light to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-light to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none"></div>

      {/* --- Organic Breathing Background - Multiple layers for depth --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary breath wave */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-5xl h-40 bg-brand-mint/25 blur-[100px] rounded-full transition-all ease-[cubic-bezier(0.33,0,0.67,1)]"
          style={{
            transitionDuration,
            transform: `translate(-50%, -50%) scale(${isInhale ? 1.1 : 0.85})`,
            opacity: isInhale ? 0.4 : 0.15,
          }}
        ></div>
        {/* Secondary wave - offset timing for organic feel */}
        <div
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-64 h-24 bg-brand-green/10 blur-[60px] rounded-full transition-all ease-[cubic-bezier(0.25,0.1,0.25,1)]"
          style={{
            transitionDuration: `${cycleDuration * 1.1}ms`,
            transform: `translate(-50%, -50%) scale(${isInhale ? 1.2 : 0.9})`,
            opacity: isInhale ? 0.3 : 0.1,
          }}
        ></div>
        {/* Tertiary wave - right side */}
        <div
          className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-20 bg-brand-yellow/15 blur-[50px] rounded-full transition-all ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{
            transitionDuration: `${cycleDuration * 0.9}ms`,
            transform: `translateY(-50%) scale(${isInhale ? 1.15 : 0.8})`,
            opacity: isInhale ? 0.25 : 0.08,
          }}
        ></div>
      </div>

      {/* --- Main Content Strip --- */}
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden max-w-[1920px] mx-auto">
        {renderStrip(INHALE_WORDS, 'Вдох', isInhale)}
        {renderStrip(EXHALE_WORDS, 'Выдох', !isInhale)}
      </div>
    </section>
  );
};
