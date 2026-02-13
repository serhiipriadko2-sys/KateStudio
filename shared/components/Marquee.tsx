/**
 * K Sebe Yoga Studio — Enhanced Marquee Component
 * ================================================
 * Continuous scrolling text loop (infinite marquee) using CSS animation.
 */

import React from 'react';
import { cn } from '../utils';

/* ─── Types ─────────────────────────────────────────────── */

export interface MarqueeConfig {
  /** Words to display in the scrolling loop */
  words?: string[];
  /** Animation duration in seconds (default: 40s) */
  duration?: number;
  /** Pause animation on hover (default: true) */
  pauseOnHover?: boolean;
  /** Direction (default: 'left') */
  direction?: 'left' | 'right';
  /** Visual variant */
  variant?: 'default' | 'minimal' | 'immersive';
  /** Extra CSS class */
  className?: string;
  // Compatibility props (ignored for new implementation but kept for TS)
  inhaleWords?: string[];
  exhaleWords?: string[];
  cycleDuration?: number;
  wordsDisplayed?: number;
  showProgress?: boolean;
  showParticles?: boolean;
  showIndicator?: boolean;
  pauseOffscreen?: boolean;
}

/* ─── Constants ─────────────────────────────────────────── */

const DEFAULT_WORDS = [
  'Свет',
  'Любовь',
  'Радость',
  'Энергия',
  'Сила',
  'Смелость',
  'Жизнь',
  'Вдохновение',
  'Гармония',
  'Открытость',
  'Покой',
  'Тишина',
  'Мир',
  'Баланс',
  'Лёгкость',
];

/* ─── Main Marquee ──────────────────────────────────────── */

export const Marquee: React.FC<MarqueeConfig> = ({
  words = DEFAULT_WORDS,
  inhaleWords, // Fallback if words not provided but old props used
  duration = 40,
  pauseOnHover = true,
  direction = 'left',
  variant = 'default',
  className,
}) => {
  // Use inhaleWords as fallback content if provided
  const contentSource = words === DEFAULT_WORDS && inhaleWords ? inhaleWords : words;
  // Duplicate content enough times to fill screen and loop seamlessly
  const content = [...contentSource, ...contentSource, ...contentSource, ...contentSource];

  const isImmersive = variant === 'immersive';
  const pyClass = isImmersive ? 'py-12 md:py-16' : 'py-8 md:py-10';

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden bg-brand-light border-y border-brand-green/5 select-none',
        pyClass,
        className
      )}
      aria-label="Бегущая строка с ценностями студии"
    >
      {/* Gradient masks for fade effect */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-brand-light to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-brand-light to-transparent z-20 pointer-events-none" />

      {/* Scrolling container wrapper */}
      <div className="flex min-w-full overflow-hidden">
        {/* First Loop */}
        <div
          className={cn(
            'flex whitespace-nowrap items-center shrink-0',
            'animate-marquee', // Relies on tailwind config: keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-100%); } }
            pauseOnHover && 'hover:[animation-play-state:paused]'
          )}
          style={{
            animationDuration: `${duration}s`,
            animationDirection: direction === 'right' ? 'reverse' : 'normal',
          }}
        >
          {content.map((word, i) => (
            <span
              key={`a-${i}`}
              className={cn(
                'mx-8 md:mx-12 font-serif italic text-2xl md:text-4xl text-brand-text/80',
                isImmersive && 'text-3xl md:text-5xl opacity-90'
              )}
            >
              {word}
            </span>
          ))}
        </div>

        {/* Second Loop (Exact clone for seamless infinite scroll) */}
        <div
          className={cn(
            'flex whitespace-nowrap items-center shrink-0',
            'animate-marquee',
            pauseOnHover && 'hover:[animation-play-state:paused]'
          )}
          style={{
            animationDuration: `${duration}s`,
            animationDirection: direction === 'right' ? 'reverse' : 'normal',
          }}
          aria-hidden="true"
        >
          {content.map((word, i) => (
            <span
              key={`b-${i}`}
              className={cn(
                'mx-8 md:mx-12 font-serif italic text-2xl md:text-4xl text-brand-text/80',
                isImmersive && 'text-3xl md:text-5xl opacity-90'
              )}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
