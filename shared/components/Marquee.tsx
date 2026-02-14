import React, { useState } from 'react';
import { cn } from '../utils';
import { usePrefersReducedMotion } from '../hooks';

/* ─── Types ─────────────────────────────────────────────── */

export interface MarqueeConfig {
  /**
   * Words to display during the "Exhale" phase.
   * @deprecated The component now manages its own words for Inhale/Exhale cycles.
   */
  words?: string[];
  /**
   * Duration of one full breath cycle (inhale + exhale) in seconds.
   * @deprecated The animation duration is now handled via CSS.
   */
  duration?: number;
  /** Extra CSS class */
  className?: string;
  /**
   * @deprecated No longer used.
   */
  pauseOnHover?: boolean;
  /**
   * @deprecated No longer used.
   */
  direction?: 'left' | 'right';
  /**
   * @deprecated No longer used.
   */
  variant?: 'default' | 'minimal' | 'immersive';
  /**
   * @deprecated No longer used.
   */
  inhaleWords?: string[];
}

/* ─── Constants ─────────────────────────────────────────── */

const INHALE_WORDS = ['смелость', 'энергия', 'сила', 'уверенность'];
const EXHALE_WORDS = ['гармония', 'покой', 'свет', 'любовь'];

/* ─── Main Marquee ──────────────────────────────────────── */

export const Marquee: React.FC<MarqueeConfig> = ({ className }) => {
  const [cycle, setCycle] = useState<'inhale' | 'exhale'>('inhale');
  const prefersReducedMotion = usePrefersReducedMotion();

  // Determine current content based on cycle
  const currentWords = cycle === 'inhale' ? INHALE_WORDS : EXHALE_WORDS;
  const separator = cycle === 'inhale' ? 'вдох' : 'Выдох';
  const isInhale = cycle === 'inhale';

  const handleAnimationIteration = () => {
    setCycle((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
  };

  const renderContentBlock = (keyPrefix: string) => (
    <div key={keyPrefix} className="flex items-center shrink-0 gap-8 md:gap-16 px-4 md:px-8">
      {currentWords.map((word, index) => (
        <React.Fragment key={`${keyPrefix}-${index}`}>
          <span className="font-serif italic text-4xl md:text-6xl lg:text-7xl whitespace-nowrap">
            {word}
          </span>
          <span className="font-sans text-sm md:text-base tracking-widest opacity-60 whitespace-nowrap">
            {separator}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden bg-brand-light py-12 md:py-16 select-none',
        className
      )}
      aria-label={`Дыхательная практика: ${isInhale ? 'Вдох' : 'Выдох'}`}
      role="marquee"
    >
      {/* Background decoration */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-brand-mint/20 to-transparent transition-opacity duration-1000',
          isInhale ? 'opacity-30' : 'opacity-10'
        )}
      />

      {/* Scrolling Container */}
      <div
        className={cn(
          'flex w-max animate-marquee items-center',
          prefersReducedMotion && 'animate-none'
        )}
        onAnimationIteration={handleAnimationIteration}
      >
        {/*
          Content Wrapper with Breathing Animation
          We wrap the scrolling content in a div that handles the breathing scale/opacity
        */}
        <div
          className={cn(
            'flex items-center transition-all duration-1000 ease-in-out will-change-transform',
            isInhale
              ? 'scale-105 opacity-100 tracking-wider text-brand-green'
              : 'scale-100 opacity-90 tracking-normal text-brand-text'
          )}
        >
          {/* Repeat content enough times to fill screen + buffer */}
          {[0, 1, 2, 3].map((i) => renderContentBlock(`block-${i}`))}
        </div>
      </div>
    </section>
  );
};
