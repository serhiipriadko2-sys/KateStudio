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

const DEFAULT_INHALE = ['Свет', 'Любовь', 'Энергия', 'Поток'];
const DEFAULT_EXHALE = ['Тишина', 'Покой', 'Баланс', 'Мягкость'];

export const Marquee: React.FC<MarqueeConfig> = ({
  inhaleWords = DEFAULT_INHALE,
  exhaleWords = DEFAULT_EXHALE,
  cycleDuration = 4000,
  variant = 'default',
  showIndicator = false,
}) => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, cycleDuration);
    return () => clearInterval(interval);
  }, [cycleDuration]);

  const isInhale = phase === 'inhale';
  const transitionDuration = `${cycleDuration}ms`;
  const breathingTransition = `transition-all duration-[${transitionDuration}] ease-[cubic-bezier(0.4,0,0.2,1)]`;

  const renderStrip = (words: string[], label: string, isActive: boolean) => (
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

      {words.slice(0, 4).map((word, i) => (
        <React.Fragment key={i}>
          {/* Word */}
          <span
            className={`
              text-xl sm:text-2xl md:text-4xl font-serif text-brand-text/90 whitespace-nowrap shrink-0
              transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
              ${variant === 'minimal' ? 'italic' : ''}
              ${isActive ? 'tracking-normal' : 'tracking-wide'}
            `}
            style={{ transitionDuration }}
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

  return (
    <section className="relative h-32 md:h-48 overflow-hidden flex flex-col justify-center items-center bg-brand-light border-y border-brand-green/5">
      {/* Gradient Masks */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-light to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-light to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none" />

      {/* Breathing Background */}
      <div
        className={`
          absolute top-1/2 left-0 right-0 -translate-y-1/2 h-full pointer-events-none
          transition-all ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isInhale ? 'opacity-40 scale-x-100' : 'opacity-20 scale-x-95'}
        `}
        style={{ transitionDuration }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-32 bg-brand-mint/30 blur-[80px] rounded-full" />
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden max-w-[1920px] mx-auto">
        {renderStrip(inhaleWords, 'Вдох', isInhale)}
        {renderStrip(exhaleWords, 'Выдох', !isInhale)}
      </div>
    </section>
  );
};
