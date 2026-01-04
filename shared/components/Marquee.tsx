/**
 * K Sebe Yoga Studio - Unified Marquee Component
 * ===============================================
 * Breathing visualization with customizable words and timing
 */

import React, { useState, useEffect } from 'react';

export interface MarqueeConfig {
  inhaleWords?: string[];
  exhaleWords?: string[];
  /** Breath cycle duration in ms (default: 4000) */
  cycleDuration?: number;
  /** Visual style variant */
  variant?: 'default' | 'minimal';
  /** Show animated indicator dot */
  showIndicator?: boolean;
}

const DEFAULT_INHALE = [
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
const DEFAULT_EXHALE = [
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

export const Marquee: React.FC<MarqueeConfig> = ({
  inhaleWords = DEFAULT_INHALE,
  exhaleWords = DEFAULT_EXHALE,
  cycleDuration = 4000,
  variant = 'default',
  showIndicator = false,
}) => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [wordOffset, setWordOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => {
        // Rotate words when transitioning from exhale to inhale (start of new cycle)
        if (prev === 'exhale') {
          setWordOffset((offset) => (offset + 1) % Math.max(inhaleWords.length - 3, 1));
        }
        return prev === 'inhale' ? 'exhale' : 'inhale';
      });
    }, cycleDuration);
    return () => clearInterval(interval);
  }, [cycleDuration, inhaleWords.length]);

  const isInhale = phase === 'inhale';
  const transitionDuration = `${cycleDuration}ms`;

  // Get rotated words (4 words starting from offset)
  const getRotatedWords = (words: string[]) => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      result.push(words[(wordOffset + i) % words.length]);
    }
    return result;
  };

  const renderStrip = (words: string[], label: string, isActive: boolean) => {
    const rotatedWords = getRotatedWords(words);
    return (
      <div
        className={`
          absolute inset-0 flex items-center justify-center w-full
          gap-6 sm:gap-12 md:gap-24 px-4
          transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isActive ? 'opacity-100 blur-0 scale-100 z-10' : 'opacity-0 blur-sm scale-95 z-0'}
        `}
        style={{ transitionDuration }}
      >
        {/* First Label */}
        <span
          className={`
            text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-green/60 shrink-0
            transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
          `}
          style={{ transitionDuration }}
        >
          {label}
          {showIndicator && isActive && phase === 'inhale' && (
            <span className="inline-block w-1.5 h-1.5 bg-brand-green rounded-full ml-2 animate-ping" />
          )}
        </span>

        {rotatedWords.map((word, i) => (
          <React.Fragment key={`${wordOffset}-${i}`}>
            {/* Word */}
            <span
              className={`
                text-xl sm:text-2xl md:text-4xl font-serif text-brand-text/90 whitespace-nowrap shrink-0
                transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
                ${variant === 'minimal' ? 'italic' : ''}
                ${isActive ? 'tracking-normal opacity-100' : 'tracking-wide opacity-0'}
              `}
              style={{
                transitionDuration,
                transitionDelay: isActive ? `${i * 100}ms` : '0ms',
              }}
            >
              {word}
            </span>

            {/* Label */}
            <span
              className={`
                text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-green/60 shrink-0
                transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
                ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
              `}
              style={{ transitionDuration }}
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
      {/* Gradient Masks */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-light to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-light to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none" />

      {/* Organic Breathing Background - Multiple layers for depth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary breath wave */}
        <div
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[120%] max-w-5xl h-40 bg-brand-mint/25 blur-[100px] rounded-full
            transition-all ease-[cubic-bezier(0.33,0,0.67,1)]
          `}
          style={{
            transitionDuration,
            transform: `translate(-50%, -50%) scale(${isInhale ? 1.1 : 0.85})`,
            opacity: isInhale ? 0.4 : 0.15,
          }}
        />
        {/* Secondary wave - offset timing for organic feel */}
        <div
          className={`
            absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2
            w-64 h-24 bg-brand-green/10 blur-[60px] rounded-full
            transition-all ease-[cubic-bezier(0.25,0.1,0.25,1)]
          `}
          style={{
            transitionDuration: `${cycleDuration * 1.1}ms`,
            transform: `translate(-50%, -50%) scale(${isInhale ? 1.2 : 0.9})`,
            opacity: isInhale ? 0.3 : 0.1,
          }}
        />
        {/* Tertiary wave - right side */}
        <div
          className={`
            absolute top-1/2 right-1/4 -translate-y-1/2
            w-48 h-20 bg-brand-yellow/15 blur-[50px] rounded-full
            transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
          `}
          style={{
            transitionDuration: `${cycleDuration * 0.9}ms`,
            transform: `translateY(-50%) scale(${isInhale ? 1.15 : 0.8})`,
            opacity: isInhale ? 0.25 : 0.08,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden max-w-[1920px] mx-auto">
        {renderStrip(inhaleWords, 'Вдох', isInhale)}
        {renderStrip(exhaleWords, 'Выдох', !isInhale)}
      </div>
    </section>
  );
};
