import React, { useState, useEffect } from 'react';
import { cn } from '../utils';

/* ─── Types ─────────────────────────────────────────────── */

export interface MarqueeConfig {
  /** Words to display during the "Exhale" phase */
  words?: string[];
  /** Duration of one full breath cycle (inhale + exhale) in seconds */
  duration?: number;
  /** Extra CSS class */
  className?: string;
  // Compatibility props (kept to prevent breaking changes, though functionality changes)
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  variant?: 'default' | 'minimal' | 'immersive';
  inhaleWords?: string[];
}

/* ─── Constants ─────────────────────────────────────────── */

const DEFAULT_EXHALE_WORDS = [
  'смелость',
  'энергия',
  'сила',
  'любовь',
  'радость',
  'гармония',
  'покой',
  'свет',
];

/* ─── Main Marquee ──────────────────────────────────────── */

export const Marquee: React.FC<MarqueeConfig> = ({
  words = DEFAULT_EXHALE_WORDS,
  duration = 8, // 4s inhale, 4s exhale
  className,
}) => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [wordIndex, setWordIndex] = useState(0);

  // Cycle phases
  useEffect(() => {
    const interval = setInterval(
      () => {
        setPhase((prev) => {
          if (prev === 'inhale') {
            return 'exhale';
          } else {
            setWordIndex((prevIndex) => (prevIndex + 1) % words.length);
            return 'inhale';
          }
        });
      },
      (duration * 1000) / 2
    );

    return () => clearInterval(interval);
  }, [duration, words.length]);

  const currentWord = phase === 'inhale' ? 'вдох' : words[wordIndex];
  const isInhale = phase === 'inhale';

  return (
    <section
      className={cn(
        'relative w-full flex justify-center items-center py-24 md:py-32 overflow-hidden bg-brand-light select-none',
        className
      )}
      aria-label="Дыхательная практика: вдох и качество"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-b from-transparent via-brand-mint/20 to-transparent" />

      {/* Main Text Container */}
      <div
        className={cn(
          'relative z-10 flex flex-col items-center justify-center transition-all ease-in-out'
        )}
        style={{
          transitionDuration: `${(duration * 1000) / 2}ms`,
          transform: isInhale ? 'scale(1.15)' : 'scale(1.0)',
          opacity: isInhale ? 1 : 0.85,
        }}
      >
        <h2
          className={cn(
            'font-serif italic text-4xl md:text-6xl lg:text-7xl transition-colors duration-1000',
            isInhale ? 'text-brand-green' : 'text-brand-text'
          )}
        >
          {currentWord}
        </h2>
      </div>
    </section>
  );
};
