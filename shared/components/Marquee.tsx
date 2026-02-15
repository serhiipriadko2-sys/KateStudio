import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../utils';

/* ─── Types ─────────────────────────────────────────────── */

export interface MarqueeConfig {
  /** Words for the inhale (energy/confidence) cycle */
  inhaleWords?: string[];
  /** Words for the exhale (calm/peace) cycle */
  words?: string[];
  /** Full breath cycle in seconds (inhale + exhale). Default: 10 */
  duration?: number;
  /** Extra CSS class */
  className?: string;
  pauseOnHover?: boolean;
  direction?: 'left' | 'right';
  variant?: 'default' | 'minimal' | 'immersive';
}

/* ─── Constants ─────────────────────────────────────────── */

const DEFAULT_INHALE_WORDS = [
  'смелость',
  'энергия',
  'сила',
  'уверенность',
  'радость',
  'движение',
  'огонь',
  'мощь',
];

const DEFAULT_EXHALE_WORDS = [
  'гармония',
  'покой',
  'тишина',
  'любовь',
  'свет',
  'нежность',
  'мягкость',
  'тепло',
];

const SEPARATOR_INHALE = 'вдох';
const SEPARATOR_EXHALE = 'выдох';

/* ─── Helpers ──────────────────────────────────────────── */

/** Build the display sequence: word · separator · word · separator · … */
function buildTrack(words: string[], separator: string): string[] {
  const items: string[] = [];
  for (const w of words) {
    items.push(w, separator);
  }
  return items;
}

/** Check if user prefers reduced motion */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ─── WordStrip — a single row of words (no scrolling) ── */

interface WordStripProps {
  items: string[];
  separator: string;
  isInhale: boolean;
}

const WordStrip: React.FC<WordStripProps> = ({ items, separator, isInhale }) => (
  <>
    {items.map((word, i) => {
      const isSep = word === separator;
      return (
        <span key={i} className="flex items-center">
          <span
            className={cn(
              'inline-block px-2 md:px-4 font-serif text-lg md:text-2xl lg:text-3xl',
              isSep
                ? 'italic text-brand-green/60 text-base md:text-xl lg:text-2xl font-light'
                : isInhale
                  ? 'text-brand-dark'
                  : 'text-brand-text/80'
            )}
          >
            {word}
          </span>
          <span
            className={cn(
              'inline-block w-1.5 h-1.5 rounded-full mx-2 md:mx-3 shrink-0',
              isInhale ? 'bg-brand-green/30' : 'bg-stone-300/40'
            )}
            aria-hidden="true"
          />
        </span>
      );
    })}
  </>
);

/* ─── Main Breathing Strip ──────────────────────────────── */

export const Marquee: React.FC<MarqueeConfig> = ({
  inhaleWords = DEFAULT_INHALE_WORDS,
  words = DEFAULT_EXHALE_WORDS,
  duration = 10,
  className,
  pauseOnHover = false,
}) => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const breathRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);

  const inhaleTrack = buildTrack(inhaleWords, SEPARATOR_INHALE);
  const exhaleTrack = buildTrack(words, SEPARATOR_EXHALE);
  const isInhale = phase === 'inhale';

  /** Half the cycle = one phase (inhale OR exhale) */
  const phaseDurationMs = (duration / 2) * 1000;

  /*
   * Breathing animation via Web Animations API.
   *
   * Each phase is a single-iteration animation:
   *   inhale → scale(0.97) → scale(1.04), letter-spacing widens, opacity rises
   *   exhale → scale(1.04) → scale(0.97), letter-spacing narrows, opacity drops
   *
   * On finish → switch phase (content crossfades) → restart with opposite keyframes.
   * No horizontal scrolling, no timers — tied to real animation completion.
   */
  useEffect(() => {
    const el = breathRef.current;
    if (!el || prefersReducedMotion()) return;

    let cancelled = false;
    let currentPhase: 'inhale' | 'exhale' = 'inhale';

    const inhaleKf: Keyframe[] = [
      { transform: 'scale(0.97)', letterSpacing: '0em', opacity: 0.85 },
      { transform: 'scale(1.04)', letterSpacing: '0.03em', opacity: 1 },
    ];
    const exhaleKf: Keyframe[] = [
      { transform: 'scale(1.04)', letterSpacing: '0.03em', opacity: 1 },
      { transform: 'scale(0.97)', letterSpacing: '0em', opacity: 0.85 },
    ];

    const run = () => {
      if (cancelled) return;

      const anim = el.animate(currentPhase === 'inhale' ? inhaleKf : exhaleKf, {
        duration: phaseDurationMs,
        easing: 'ease-in-out',
        fill: 'forwards',
      });
      animRef.current = anim;

      anim.onfinish = () => {
        if (cancelled) return;
        currentPhase = currentPhase === 'inhale' ? 'exhale' : 'inhale';
        setPhase(currentPhase);
        run();
      };
    };

    run();

    return () => {
      cancelled = true;
      animRef.current?.cancel();
    };
  }, [phaseDurationMs]);

  /* Pause on hover */
  useEffect(() => {
    if (!pauseOnHover) return;
    const el = breathRef.current;
    if (!el) return;

    const pause = () => animRef.current?.pause();
    const resume = () => animRef.current?.play();
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);
    return () => {
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
    };
  }, [pauseOnHover]);

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden bg-brand-light select-none',
        'py-5 md:py-6',
        className
      )}
      aria-label="Дыхательная полоса"
    >
      {/* Background tint that shifts with breath phase */}
      <div
        className={cn(
          'absolute inset-0 pointer-events-none transition-colors duration-[3000ms]',
          isInhale ? 'bg-brand-mint/5' : 'bg-stone-100/40'
        )}
      />

      {/* Breathing container — the whole block scales/pulses */}
      <div ref={breathRef} className="relative h-10 md:h-12">
        {/* Inhale track — crossfades in when phase === 'inhale' */}
        <div
          className={cn(
            'breath-track absolute inset-0 flex items-center justify-center whitespace-nowrap',
            'transition-opacity duration-[2000ms] ease-in-out',
            isInhale ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={!isInhale}
        >
          <WordStrip items={inhaleTrack} separator={SEPARATOR_INHALE} isInhale={true} />
        </div>

        {/* Exhale track — crossfades in when phase === 'exhale' */}
        <div
          className={cn(
            'breath-track absolute inset-0 flex items-center justify-center whitespace-nowrap',
            'transition-opacity duration-[2000ms] ease-in-out',
            !isInhale ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={isInhale}
        >
          <WordStrip items={exhaleTrack} separator={SEPARATOR_EXHALE} isInhale={false} />
        </div>
      </div>

      {/* Phase indicator */}
      <div className="flex justify-center mt-2">
        <span
          className={cn(
            'text-xs tracking-[0.2em] uppercase transition-all duration-[2000ms] ease-in-out font-light',
            isInhale ? 'text-brand-green/50' : 'text-stone-400/50'
          )}
        >
          {isInhale ? 'вдох' : 'выдох'}
        </span>
      </div>
    </section>
  );
};
