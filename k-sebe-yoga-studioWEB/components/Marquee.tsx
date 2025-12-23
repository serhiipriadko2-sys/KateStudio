import React, { useState, useEffect } from 'react';

const INHALE_WORDS = ['Свет', 'Любовь', 'Энергия', 'Поток'];
const EXHALE_WORDS = ['Тишина', 'Покой', 'Баланс', 'Мягкость'];

export const Marquee: React.FC = () => {
  const [isInhale, setIsInhale] = useState(true);

  useEffect(() => {
    // 4 seconds per phase - coherent breathing rhythm
    const interval = setInterval(() => {
      setIsInhale((prev) => !prev);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const breathingTransition = 'transition-all duration-[4000ms] ease-[cubic-bezier(0.4,0,0.2,1)]';

  const renderStrip = (words: string[], label: string, isActive: boolean) => (
    <div
      className={`
        absolute inset-0 flex items-center justify-center w-full
        gap-6 sm:gap-12 md:gap-24 px-4
        ${breathingTransition}
        ${isActive ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-95'}
    `}
    >
      {/* Pattern: Label - Word - Label - Word - Label - Word - Label - Word - Label (Total 9 elements) */}

      {/* 1. First Label */}
      <span
        className={`
            text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-green/60 shrink-0
            ${breathingTransition}
            ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        `}
      >
        {label}
      </span>

      {words.slice(0, 4).map((word, i) => (
        <React.Fragment key={i}>
          {/* Word */}
          <span
            className={`
                    text-xl sm:text-2xl md:text-4xl font-serif text-brand-text/90 whitespace-nowrap shrink-0
                    ${breathingTransition}
                    ${isActive ? 'tracking-normal' : 'tracking-wide'}
                `}
          >
            {word}
          </span>

          {/* Label */}
          <span
            className={`
                    text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-green/60 shrink-0
                    ${breathingTransition}
                    ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
                `}
          >
            {label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section className="relative h-32 md:h-48 overflow-hidden flex flex-col justify-center items-center bg-brand-light border-y border-brand-green/5">
      {/* --- Gradient Masks for "Weaving" Effect --- */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-light to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-light to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none"></div>

      {/* --- Organic Breathing Background --- */}
      <div
        className={`
          absolute top-1/2 left-0 right-0 -translate-y-1/2 h-full pointer-events-none
          ${breathingTransition}
          ${isInhale ? 'opacity-40 scale-x-100' : 'opacity-20 scale-x-95'}
      `}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-32 bg-brand-mint/30 blur-[80px] rounded-full"></div>
      </div>

      {/* --- Main Content Strip --- */}
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden max-w-[1920px] mx-auto">
        {renderStrip(INHALE_WORDS, 'Вдох', isInhale)}
        {renderStrip(EXHALE_WORDS, 'Выдох', !isInhale)}
      </div>
    </section>
  );
};
