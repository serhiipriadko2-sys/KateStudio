import React, { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '../utils';

/* ─── Types ─────────────────────────────────────────────── */

export interface MarqueeConfig {
  /** Words for the inhale (energy/confidence) cycle */
  inhaleWords?: string[];
  /** Words for the exhale (calm/peace) cycle */
  words?: string[];
  /** Scroll speed — seconds for one full marquee loop */
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

/* ─── Track sub-component (one scrolling row) ──────────── */

interface TrackRowProps {
  items: string[];
  separator: string;
  isInhale: boolean;
  duration: number;
  pauseOnHover: boolean;
  visible: boolean;
  onIteration?: () => void;
}

const TrackRow: React.FC<TrackRowProps> = ({
  items,
  separator,
  isInhale,
  duration,
  pauseOnHover,
  visible,
  onIteration,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const onIterationRef = useRef(onIteration);
  onIterationRef.current = onIteration;

  /*
   * Web Animations API — single-iteration loop that restarts on finish.
   * onfinish fires at the exact moment the marquee completes one full pass,
   * giving us precise cycle switching (no timers).
   * At translateX(-50%) the visual is identical to translateX(0) because the
   * content is duplicated — so the restart is seamless.
   */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    // Reduced motion: no scrolling, content stays visible & readable
    if (prefersReducedMotion()) return;

    let cancelled = false;

    const run = () => {
      if (cancelled) return;
      const anim = el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], {
        duration: duration * 1000,
        easing: 'linear',
      });
      animRef.current = anim;
      anim.onfinish = () => {
        if (cancelled) return;
        onIterationRef.current?.();
        run(); // seamless restart — -50% ≡ 0% visually
      };
    };

    run();

    return () => {
      cancelled = true;
      animRef.current?.cancel();
    };
  }, [duration]);

  /* Pause on hover */
  useEffect(() => {
    if (!pauseOnHover) return;
    const el = trackRef.current;
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
    <div
      ref={trackRef}
      className={cn(
        'marquee-track flex whitespace-nowrap will-change-transform',
        'absolute inset-y-0 left-0 w-max items-center',
        'transition-opacity duration-[1500ms] ease-in-out'
      )}
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
      aria-hidden={!visible}
    >
      {/* Two identical halves → seamless loop */}
      {[0, 1].map((half) => (
        <span key={half} className="flex items-center shrink-0" aria-hidden={half === 1}>
          {items.map((word, i) => {
            const isSep = word === separator;
            return (
              <span key={`${half}-${i}`} className="flex items-center">
                <span
                  className={cn(
                    'inline-block px-3 md:px-5 font-serif text-lg md:text-2xl lg:text-3xl',
                    'transition-all duration-[2000ms] ease-in-out',
                    isSep
                      ? 'italic text-brand-green/60 text-base md:text-xl lg:text-2xl font-light'
                      : isInhale
                        ? 'text-brand-dark tracking-wide'
                        : 'text-brand-text/80 tracking-normal'
                  )}
                  style={{
                    transform: isInhale ? 'scale(1.03)' : 'scale(1)',
                  }}
                >
                  {word}
                </span>
                {/* Dot separator between items */}
                <span
                  className={cn(
                    'inline-block w-1.5 h-1.5 rounded-full mx-2 md:mx-3 shrink-0',
                    'transition-colors duration-[2000ms]',
                    isInhale ? 'bg-brand-green/30' : 'bg-stone-300/40'
                  )}
                  aria-hidden="true"
                />
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

/* ─── Main Marquee ──────────────────────────────────────── */

export const Marquee: React.FC<MarqueeConfig> = ({
  inhaleWords = DEFAULT_INHALE_WORDS,
  words = DEFAULT_EXHALE_WORDS,
  duration = 20,
  className,
  pauseOnHover = false,
}) => {
  const [cycle, setCycle] = useState<'inhale' | 'exhale'>('inhale');
  const containerRef = useRef<HTMLDivElement>(null);

  const inhaleTrack = buildTrack(inhaleWords, SEPARATOR_INHALE);
  const exhaleTrack = buildTrack(words, SEPARATOR_EXHALE);
  const isInhale = cycle === 'inhale';

  /** Switch cycle when the VISIBLE track completes one full scroll pass */
  const handleIteration = useCallback(() => {
    setCycle((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
  }, []);

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
          'absolute inset-0 pointer-events-none transition-colors duration-[2000ms]',
          isInhale ? 'bg-brand-mint/5' : 'bg-stone-100/40'
        )}
      />

      {/* Container holds both tracks stacked; crossfade via opacity */}
      <div ref={containerRef} className="relative h-10 md:h-12">
        {/* Inhale track — always mounted, fades in/out */}
        <TrackRow
          items={inhaleTrack}
          separator={SEPARATOR_INHALE}
          isInhale={true}
          duration={duration}
          pauseOnHover={pauseOnHover}
          visible={isInhale}
          onIteration={isInhale ? handleIteration : undefined}
        />

        {/* Exhale track — always mounted, fades in/out */}
        <TrackRow
          items={exhaleTrack}
          separator={SEPARATOR_EXHALE}
          isInhale={false}
          duration={duration}
          pauseOnHover={pauseOnHover}
          visible={!isInhale}
          onIteration={!isInhale ? handleIteration : undefined}
        />
      </div>

      {/* Phase indicator */}
      <div className="flex justify-center mt-2">
        <span
          className={cn(
            'text-xs tracking-[0.2em] uppercase transition-all duration-[1500ms] ease-in-out font-light',
            isInhale ? 'text-brand-green/50' : 'text-stone-400/50'
          )}
        >
          {isInhale ? 'вдох' : 'выдох'}
        </span>
      </div>
    </section>
  );
};
