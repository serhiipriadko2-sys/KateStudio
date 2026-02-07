/**
 * K Sebe Yoga Studio — Enhanced Marquee Component
 * ================================================
 * Breathing visualization with ambient particles, breath progress ring,
 * wave-cascade word choreography, and visibility-aware performance.
 *
 * Architecture:
 * - Two simultaneous word layers (inhale / exhale) with crossfade
 * - Fog dissolve via CSS mask-image with animated radial gradient
 * - Per-slot stagger delays with wave curve for organic asymmetry
 * - Ambient floating particles that breathe with the phase
 * - SVG breath ring that fills / drains with each phase
 * - IntersectionObserver pauses animation when off-screen
 * - Fully respects prefers-reduced-motion
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks';

/* ─── Types ─────────────────────────────────────────────── */

export interface MarqueeConfig {
  inhaleWords?: string[];
  exhaleWords?: string[];
  /** Breath phase duration in ms (default: 5000) */
  cycleDuration?: number;
  /** How many concept words per line (default: 3) */
  wordsDisplayed?: number;
  /** Visual variant */
  variant?: 'default' | 'minimal' | 'immersive';
  /** Show breath progress ring (default: auto — true for immersive) */
  showProgress?: boolean;
  /** Show ambient floating particles (default: auto — true for immersive) */
  showParticles?: boolean;
  /** Show animated indicator dot */
  showIndicator?: boolean;
  /** Pause when scrolled out of view (default: true) */
  pauseOffscreen?: boolean;
  /** Extra CSS class on the outer section */
  className?: string;
}

type Phase = 'inhale' | 'exhale';

type SlotMotion = {
  delayInMs: number;
  delayOutMs: number;
  inhale: { x: number; y: number; r: number };
  exhale: { x: number; y: number; r: number };
};

type ParticleConfig = {
  id: number;
  left: string;
  top: string;
  size: number;
  baseOpacity: number;
  driftX: number;
  driftY: number;
  delay: number;
};

/* ─── Constants ─────────────────────────────────────────── */

const DEFAULT_INHALE = [
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
];

const DEFAULT_EXHALE = [
  'Покой',
  'Тишина',
  'Мир',
  'Баланс',
  'Лёгкость',
  'Принятие',
  'Освобождение',
  'Мягкость',
  'Доверие',
  'Умиротворение',
];

const DEFAULT_WORDS_DISPLAYED = 3;
const EASING = 'cubic-bezier(0.33, 0, 0.67, 1)';

/* ─── Helpers ───────────────────────────────────────────── */

/** Sequential word rotation: cycles through all words before repeating. */
const getNextWords = (words: string[], count: number, offset: number): string[] => {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(words[(offset + i) % words.length]);
  }
  return result;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/* ─── useVisibility ─────────────────────────────────────── */

function useVisibility(ref: React.RefObject<HTMLElement | null>, enabled: boolean): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.1,
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, enabled]);

  return visible;
}

/* ─── AmbientParticles ──────────────────────────────────── */

const AmbientParticles: React.FC<{
  isInhale: boolean;
  durationMs: number;
  count: number;
}> = React.memo(({ isInhale, durationMs, count }) => {
  const particles = useMemo<ParticleConfig[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${8 + Math.random() * 84}%`,
        top: `${12 + Math.random() * 76}%`,
        size: 2 + Math.random() * 3.5,
        baseOpacity: 0.08 + Math.random() * 0.18,
        driftX: (Math.random() - 0.5) * 28,
        driftY: (Math.random() - 0.5) * 18,
        delay: Math.random() * 900,
      })),
    [count]
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-brand-green"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: isInhale ? p.baseOpacity * 1.6 : p.baseOpacity * 0.35,
            transform: isInhale
              ? `translate(${p.driftX}px, ${p.driftY}px) scale(1.4)`
              : `translate(${-p.driftX * 0.4}px, ${-p.driftY * 0.4}px) scale(0.6)`,
            transition: `all ${durationMs}ms ${EASING}`,
            transitionDelay: `${p.delay}ms`,
            filter: `blur(${isInhale ? 0.5 : 1.2}px)`,
          }}
        />
      ))}
    </div>
  );
});
AmbientParticles.displayName = 'AmbientParticles';

/* ─── BreathRing ────────────────────────────────────────── */

const BreathRing: React.FC<{
  isInhale: boolean;
  durationMs: number;
  size: number;
}> = React.memo(({ isInhale, durationMs, size }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const r = size / 2 - 3;
  const circumference = 2 * Math.PI * r;
  const showFilled = mounted && isInhale;

  return (
    <svg
      width={size}
      height={size}
      className="absolute left-1/2 top-1/2 pointer-events-none"
      style={{ transform: 'translate(-50%, -50%) rotate(-90deg)' }}
      aria-hidden="true"
    >
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.75}
        className="text-brand-green/10"
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={showFilled ? 0 : circumference}
        className="text-brand-green/25"
        style={{ transition: `stroke-dashoffset ${durationMs}ms ${EASING}` }}
      />
    </svg>
  );
});
BreathRing.displayName = 'BreathRing';

/* ─── Main Marquee ──────────────────────────────────────── */

export const Marquee: React.FC<MarqueeConfig> = ({
  inhaleWords = DEFAULT_INHALE,
  exhaleWords = DEFAULT_EXHALE,
  cycleDuration = 5000,
  wordsDisplayed = DEFAULT_WORDS_DISPLAYED,
  variant = 'default',
  showProgress,
  showParticles,
  showIndicator = false,
  pauseOffscreen = true,
  className,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const wordOffsetRef = useRef(0);
  const [phase, setPhase] = useState<Phase>('inhale');
  const [inhaleLayerWords, setInhaleLayerWords] = useState<string[]>([]);
  const [exhaleLayerWords, setExhaleLayerWords] = useState<string[]>([]);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isVisible = useVisibility(sectionRef, pauseOffscreen);

  const isMinimal = variant === 'minimal';
  const isImmersive = variant === 'immersive';
  const isInhale = phase === 'inhale';

  // Resolve feature flags (variant defaults unless overridden)
  const particlesOn = showParticles ?? isImmersive;
  const progressOn = showProgress ?? isImmersive;

  /* ── Init words ──────────────────────────────────────── */

  useEffect(() => {
    setInhaleLayerWords(getNextWords(inhaleWords, wordsDisplayed, 0));
    setExhaleLayerWords(getNextWords(exhaleWords, wordsDisplayed, wordsDisplayed));
    wordOffsetRef.current = wordsDisplayed * 2;
  }, [inhaleWords, exhaleWords, wordsDisplayed]);

  /* ── Phase cycle ─────────────────────────────────────── */

  useEffect(() => {
    if (prefersReducedMotion || !isVisible) {
      setPhase('inhale');
      return;
    }

    const id = window.setInterval(() => {
      setPhase((prev) => {
        const next: Phase = prev === 'inhale' ? 'exhale' : 'inhale';
        const offset = wordOffsetRef.current;

        if (next === 'inhale') {
          setInhaleLayerWords(getNextWords(inhaleWords, wordsDisplayed, offset));
        } else {
          setExhaleLayerWords(getNextWords(exhaleWords, wordsDisplayed, offset));
        }
        wordOffsetRef.current = offset + wordsDisplayed;
        return next;
      });
    }, cycleDuration);

    return () => window.clearInterval(id);
  }, [cycleDuration, inhaleWords, exhaleWords, wordsDisplayed, prefersReducedMotion, isVisible]);

  /* ── Computed values ─────────────────────────────────── */

  const slots = wordsDisplayed * 2 + 1;
  const animMs = prefersReducedMotion ? 0 : Math.max(1400, Math.round(cycleDuration * 0.78));
  const layerInDelayMs = prefersReducedMotion ? 0 : Math.round(cycleDuration * 0.06);
  const transitionDuration = `${animMs}ms`;

  const fogMask = useMemo(
    () =>
      'radial-gradient(130% 180% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 118%)',
    []
  );

  const slotMotion = useMemo<SlotMotion[]>(() => {
    const mid = Math.floor(slots / 2);
    return Array.from({ length: slots }, (_, i) => {
      const dist = Math.abs(i - mid);
      // Wave curve — centre slots animate first, edges follow
      const wave = 1 - dist / Math.max(mid, 1);
      return {
        delayInMs: Math.round(dist * 110 * (1 - wave * 0.3) + rand(0, 60)),
        delayOutMs: Math.round(dist * 70 + rand(0, 50)),
        inhale: { x: rand(-12, 12), y: rand(-8, 8), r: rand(-1.5, 1.5) },
        exhale: { x: rand(-12, 12), y: rand(-8, 8), r: rand(-1.5, 1.5) },
      };
    });
  }, [slots]);

  /* ── Style builders ──────────────────────────────────── */

  const getLayerWords = (type: Phase) => (type === 'inhale' ? inhaleLayerWords : exhaleLayerWords);

  const getMaskPosition = (type: Phase, active: boolean): string => {
    if (type === 'inhale') return active ? '48% 46%' : '43% 60%';
    return active ? '52% 54%' : '57% 40%';
  };

  const getMaskSize = (active: boolean): string => (active ? '190% 260%' : '85% 115%');

  const layerStyle = (type: Phase, isCurrent: boolean): React.CSSProperties => ({
    zIndex: isCurrent ? 2 : 1,
    opacity: isCurrent ? 1 : 0,
    filter: `blur(${isCurrent ? 0 : 18}px)`,
    // Directional drift: inhale layer floats up, exhale drifts down
    transform: `translate3d(0, ${isCurrent ? 0 : type === 'inhale' ? -10 : 10}px, 0) scale(${isCurrent ? 1 : 0.985})`,
    transitionProperty:
      'opacity, transform, filter, -webkit-mask-position, -webkit-mask-size, mask-position, mask-size',
    transitionDuration: `${animMs}ms`,
    transitionTimingFunction: EASING,
    transitionDelay: `${isCurrent ? layerInDelayMs : 0}ms`,
    WebkitMaskImage: fogMask,
    maskImage: fogMask,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: getMaskPosition(type, isCurrent),
    maskPosition: getMaskPosition(type, isCurrent),
    WebkitMaskSize: getMaskSize(isCurrent),
    maskSize: getMaskSize(isCurrent),
    willChange: 'opacity, transform, filter',
  });

  const slotStyle = (type: Phase, idx: number, isCurrent: boolean): React.CSSProperties => {
    const m = slotMotion[idx];
    const base = type === 'inhale' ? m.inhale : m.exhale;
    const x = isCurrent ? base.x : base.x * 1.6;
    const y = isCurrent ? base.y : base.y * 1.6 + (type === 'inhale' ? -12 : 12);
    const r = isCurrent ? base.r : base.r * 1.4;

    return {
      opacity: isCurrent ? 1 : 0,
      filter: `blur(${isCurrent ? 0 : 10}px)`,
      transform: `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`,
      transitionProperty: 'opacity, transform, filter',
      transitionDuration: `${animMs}ms`,
      transitionTimingFunction: EASING,
      transitionDelay: `${isCurrent ? m.delayInMs : m.delayOutMs}ms`,
      willChange: 'opacity, transform, filter',
    };
  };

  /* ── Render layer ────────────────────────────────────── */

  const renderLayer = (type: Phase) => {
    const isCurrent = phase === type;
    const actionWord = type === 'inhale' ? 'Вдох' : 'Выдох';
    const concepts = getLayerWords(type);

    return (
      <div
        aria-hidden="true"
        className="absolute inset-0 w-full flex justify-between items-center px-4 md:px-12 max-w-[1400px] mx-auto pointer-events-none select-none"
        style={layerStyle(type, isCurrent)}
      >
        {Array.from({ length: slots }).map((_, slotIndex) => {
          const isAction = slotIndex % 2 === 0;
          const conceptIndex = Math.floor(slotIndex / 2);
          const concept = concepts[conceptIndex % Math.max(1, concepts.length)];

          return (
            <div key={`${type}-${slotIndex}`} className="flex-1 flex justify-center text-center">
              <div style={slotStyle(type, slotIndex, isCurrent)}>
                {isAction ? (
                  <span
                    className={
                      'font-sans font-bold uppercase text-[10px] sm:text-xs md:text-sm ' +
                      (type === 'inhale'
                        ? 'text-brand-green/80 drop-shadow-[0_0_8px_rgba(87,167,115,0.35)] tracking-[0.48em]'
                        : 'text-stone-300 tracking-[0.18em]')
                    }
                  >
                    {actionWord}
                    {showIndicator && isCurrent && type === 'inhale' && slotIndex === slots - 1 && (
                      <span className="inline-block w-1 h-1 bg-brand-green rounded-full ml-2 animate-ping" />
                    )}
                  </span>
                ) : (
                  <span
                    className={
                      'font-serif italic whitespace-nowrap ' +
                      'text-base sm:text-xl md:text-3xl ' +
                      (type === 'inhale'
                        ? 'text-brand-text/90 font-normal drop-shadow-[0_0_14px_rgba(255,255,255,0.35)]'
                        : 'text-stone-300 font-light')
                    }
                  >
                    {concept}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  /* ── Height by variant ───────────────────────────────── */

  const heightClass = isImmersive ? 'h-56 md:h-64' : 'h-40 md:h-48';

  /* ─── Render ─────────────────────────────────────────── */

  return (
    <section
      ref={sectionRef}
      aria-label="Дыхательный поток: вдох и выдох"
      className={`relative ${heightClass} overflow-hidden flex flex-col justify-center items-center bg-brand-light border-y border-brand-green/5${className ? ` ${className}` : ''}`}
    >
      {/* Accessible live description */}
      <p className="sr-only" aria-live="polite">
        {isInhale
          ? 'Фаза вдоха — вдохните глубоко и наполнитесь энергией.'
          : 'Фаза выдоха — выдохните и отпустите напряжение.'}
      </p>

      {/* Gradient edge masks */}
      {!isMinimal && (
        <>
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-light to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-light to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none" />
        </>
      )}

      {/* Organic breathing background */}
      {!isMinimal && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Primary breath wave */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-5xl h-44 bg-brand-mint/25 blur-[110px] rounded-full"
            style={{
              transition: `transform ${transitionDuration} ${EASING}, opacity ${transitionDuration} ${EASING}`,
              transform: `translate(-50%, -50%) scale(${isInhale ? 1.14 : 0.84})`,
              opacity: isInhale ? 0.48 : 0.14,
            }}
          />
          {/* Left accent */}
          <div
            className="absolute top-1/2 left-[18%] -translate-y-1/2 w-48 h-24 bg-brand-green/15 blur-[60px] rounded-full"
            style={{
              transition: `transform ${transitionDuration} ${EASING}, opacity ${transitionDuration} ${EASING}`,
              transform: `translateY(-50%) scale(${isInhale ? 1.22 : 0.8})`,
              opacity: isInhale ? 0.32 : 0.1,
            }}
          />
          {/* Right accent */}
          <div
            className="absolute top-1/2 right-[16%] -translate-y-1/2 w-56 h-28 bg-brand-yellow/20 blur-[70px] rounded-full"
            style={{
              transition: `transform ${transitionDuration} ${EASING}, opacity ${transitionDuration} ${EASING}`,
              transform: `translateY(-50%) scale(${isInhale ? 1.2 : 0.78})`,
              opacity: isInhale ? 0.3 : 0.08,
            }}
          />
          {/* Horizontal glow band */}
          <div
            className="absolute inset-x-[8%] top-1/2 -translate-y-1/2 h-24 bg-gradient-to-r from-transparent via-brand-green/10 to-transparent blur-[40px]"
            style={{
              transition: `opacity ${transitionDuration} ${EASING}`,
              opacity: isInhale ? 0.55 : 0.15,
            }}
          />

          {/* Additional immersive depth layers */}
          {isImmersive && (
            <>
              <div
                className="absolute top-1/3 left-[35%] w-32 h-32 bg-brand-green/8 blur-[80px] rounded-full"
                style={{
                  transition: `transform ${transitionDuration} ${EASING}, opacity ${transitionDuration} ${EASING}`,
                  transform: `scale(${isInhale ? 1.3 : 0.7})`,
                  opacity: isInhale ? 0.25 : 0.05,
                }}
              />
              <div
                className="absolute bottom-1/3 right-[30%] w-40 h-20 bg-brand-mint/15 blur-[90px] rounded-full"
                style={{
                  transition: `transform ${transitionDuration} ${EASING}, opacity ${transitionDuration} ${EASING}`,
                  transform: `scale(${isInhale ? 1.25 : 0.75})`,
                  opacity: isInhale ? 0.2 : 0.04,
                }}
              />
            </>
          )}
        </div>
      )}

      {/* Ambient particles */}
      {particlesOn && !prefersReducedMotion && (
        <AmbientParticles
          isInhale={isInhale}
          durationMs={cycleDuration}
          count={isImmersive ? 10 : 6}
        />
      )}

      {/* Breath progress ring */}
      {progressOn && !prefersReducedMotion && (
        <BreathRing isInhale={isInhale} durationMs={cycleDuration} size={isImmersive ? 140 : 100} />
      )}

      {/* Main word layers */}
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden max-w-[1920px] mx-auto">
        {renderLayer('inhale')}
        {renderLayer('exhale')}
      </div>
    </section>
  );
};
