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
  'воля',
  'страсть',
  'мужество',
  'решимость',
  'энтузиазм',
  'жизнь',
  'творчество',
  'свобода',
  'рост',
  'победа',
  'сила духа',
  'мотивация',
  'активность',
  'борьба',
  'прогресс',
  'успех',
  'триумф',
  'энергия жизни',
  'огненная страсть',
  'непоколебимость',
  'дерзость',
  'динамика',
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
  'спокойствие',
  'мир',
  'баланс',
  'умиротворение',
  'спокойная сила',
  'мудрость',
  'сострадание',
  'принятие',
  'благодать',
  'спокойный ум',
  'радость тишины',
  'душевный покой',
  'гармоничная энергия',
  'мягкая сила',
  'внутренний свет',
  'спокойная решимость',
  'умиротворенная воля',
  'тихая мощь',
  'гармоничный баланс',
  'спокойное тепло',
  'нежная любовь',
  'тихий свет',
];

const SEPARATOR_INHALE = 'вдох';
const SEPARATOR_EXHALE = 'выдох';

const WORD_STAGGER_MS = 70;

/** CSS mask for haze/mist effect on edges */
const HAZE_MASK =
  'linear-gradient(to right, transparent 0%, black 14%, black 86%, transparent 100%)';

/* ─── Helpers ──────────────────────────────────────────── */

function buildTrack(words: string[], separator: string): string[] {
  const items: string[] = [];
  for (const w of words) {
    items.push(w, separator);
  }
  return items;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ─── WordStrip — staggered breathing wave + heartbeat dots */

interface WordStripProps {
  items: string[];
  separator: string;
  isInhale: boolean;
}

const WordStrip: React.FC<WordStripProps> = ({ items, separator, isInhale }) => (
  <>
    {items.map((word, i) => {
      const isSep = word === separator;
      const delay = i * WORD_STAGGER_MS;

      return (
        <span key={i} className="flex items-center">
          <span
            className={cn(
              'inline-block px-2 md:px-4 font-serif',
              'transition-all duration-[3000ms] ease-in-out',
              isSep
                ? 'text-sm md:text-lg lg:text-xl font-light italic'
                : 'text-lg md:text-2xl lg:text-3xl'
            )}
            style={{
              transitionDelay: `${delay}ms`,
              transform: isInhale ? 'scale(1.06) translateY(-2px)' : 'scale(0.97) translateY(1px)',
              opacity: isSep ? (isInhale ? 0.5 : 0.3) : isInhale ? 1 : 0.7,
              color: isSep
                ? undefined
                : isInhale
                  ? 'var(--color-brand-dark, #1a1a1a)'
                  : 'var(--color-brand-text, #444)',
              textShadow: isSep
                ? isInhale
                  ? '0 0 18px rgba(87, 167, 115, 0.35)'
                  : '0 0 12px rgba(168, 162, 158, 0.2)'
                : 'none',
            }}
          >
            {word}
          </span>

          {/* Heartbeat dot — double-pulse rhythm, staggered wave — only between words */}
          {!isSep && (
            <span
              className="inline-block rounded-full mx-2 md:mx-3 shrink-0 transition-[background-color,box-shadow] duration-[3000ms] ease-in-out"
              style={{
                width: '5px',
                height: '5px',
                backgroundColor: isInhale ? 'rgba(87, 167, 115, 0.5)' : 'rgba(168, 162, 158, 0.35)',
                boxShadow: isInhale ? '0 0 10px rgba(87, 167, 115, 0.35)' : 'none',
                animation: `breath-heartbeat ${isInhale ? '2s' : '2.8s'} ease-in-out infinite`,
                animationDelay: `${Math.round(delay * 0.7)}ms`,
              }}
              aria-hidden="true"
            />
          )}
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
  const [cycleCount, setCycleCount] = useState(0);
  const breathRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);

  // Rotate words on each cycle
  const rotatedInhale = [...inhaleWords.slice(cycleCount % inhaleWords.length), ...inhaleWords.slice(0, cycleCount % inhaleWords.length)];
  const currentInhaleWords = rotatedInhale.slice(0, 8);
  const rotatedExhale = [...words.slice(cycleCount % words.length), ...words.slice(0, cycleCount % words.length)];
  const currentExhaleWords = rotatedExhale.slice(0, 8);

  const inhaleTrack = buildTrack(currentInhaleWords, SEPARATOR_INHALE);
  const exhaleTrack = buildTrack(currentExhaleWords, SEPARATOR_EXHALE);
  const isInhale = phase === 'inhale';

  const phaseDurationMs = (duration / 2) * 1000;

  /*
   * Container-level breathing via Web Animations API.
   * Gentle vertical float; words add staggered CSS transitions on top.
   * Dots run their own CSS heartbeat keyframe animation.
   */
  useEffect(() => {
    const el = breathRef.current;
    if (!el || prefersReducedMotion()) return;

    let cancelled = false;
    let currentPhase: 'inhale' | 'exhale' = 'inhale';

    const inhaleKf: Keyframe[] = [
      { transform: 'translateY(2px)', opacity: 0.92 },
      { transform: 'translateY(-2px)', opacity: 1 },
    ];
    const exhaleKf: Keyframe[] = [
      { transform: 'translateY(-2px)', opacity: 1 },
      { transform: 'translateY(2px)', opacity: 0.92 },
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
        setCycleCount(prev => prev + 1);
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
        'py-6 md:py-8',
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

      {/* Breathing container — haze mask + vertical float + word wave */}
      <div
        ref={breathRef}
        className="relative h-10 md:h-14"
        style={{
          maskImage: HAZE_MASK,
          WebkitMaskImage: HAZE_MASK,
        }}
      >
        {/* Inhale words — crossfade in */}
        <div
          className={cn(
            'breath-track absolute inset-0 flex items-center justify-center whitespace-nowrap',
            'transition-opacity duration-[4000ms] ease-in-out',
            isInhale ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={!isInhale}
        >
          <WordStrip items={inhaleTrack} separator={SEPARATOR_INHALE} isInhale={true} />
        </div>

        {/* Exhale words — crossfade in */}
        <div
          className={cn(
            'breath-track absolute inset-0 flex items-center justify-center whitespace-nowrap',
            'transition-opacity duration-[4000ms] ease-in-out',
            !isInhale ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden={isInhale}
        >
          <WordStrip items={exhaleTrack} separator={SEPARATOR_EXHALE} isInhale={false} />
        </div>
      </div>

      {/* Heartbeat keyframes + reduced-motion override */}
      <style>{`
        @keyframes breath-heartbeat {
          0%, 55%, 100% { transform: scale(1); opacity: 0.1; }
          14% { transform: scale(1.2); opacity: 0.4; }
          28% { transform: scale(0.9); opacity: 0.15; }
          42% { transform: scale(1.1); opacity: 0.3; }
        }
        @media (prefers-reduced-motion: reduce) {
          .breath-track span { animation: none !important; transition: none !important; }
        }
      `}</style>
    </section>
  );
};
