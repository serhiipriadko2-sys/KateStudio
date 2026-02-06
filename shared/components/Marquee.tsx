/**
 * K Sebe Yoga Studio - Unified Marquee Component
 * ===============================================
 * Breathing visualization with customizable words and timing.
 *
 * Animation approach:
 * - Two simultaneous layers (inhale/exhale) with crossfade
 * - filter: blur(...) animated for fog dissolve
 * - mask-image with radial gradient for soft fog edges
 * - Per-slot stagger delays + micro translate/rotate for organic asymmetry
 * - will-change used sparingly (2 layers + slots)
 */

import React, { useEffect, useMemo, useState } from 'react';

export interface MarqueeConfig {
  inhaleWords?: string[];
  exhaleWords?: string[];
  /** Breath cycle duration in ms (default: 5000) */
  cycleDuration?: number;
  /** How many concepts to show in one line (default: 3) */
  wordsDisplayed?: number;
  /** Visual style variant */
  variant?: 'default' | 'minimal';
  /** Show animated indicator dot */
  showIndicator?: boolean;
}

const DEFAULT_INHALE = ['Свет', 'Любовь', 'Радость', 'Энергия', 'Сила', 'Смелость', 'Жизнь'];

const DEFAULT_EXHALE = ['Покой', 'Тишина', 'Мир', 'Баланс', 'Лёгкость', 'Принятие', 'Освобождение'];

const WORDS_DISPLAYED_DEFAULT = 3;
type Phase = 'inhale' | 'exhale';

type SlotMotion = {
  delayInMs: number;
  delayOutMs: number;
  inhale: { x: number; y: number; r: number };
  exhale: { x: number; y: number; r: number };
};

const getRandomWords = (words: string[], count: number): string[] => {
  if (words.length <= count) return words;
  const shuffled = [...words].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const Marquee: React.FC<MarqueeConfig> = ({
  inhaleWords = DEFAULT_INHALE,
  exhaleWords = DEFAULT_EXHALE,
  cycleDuration = 5000,
  wordsDisplayed = WORDS_DISPLAYED_DEFAULT,
  variant = 'default',
  showIndicator = false,
}) => {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [inhaleLayerWords, setInhaleLayerWords] = useState<string[]>([]);
  const [exhaleLayerWords, setExhaleLayerWords] = useState<string[]>([]);

  // Init layer content
  useEffect(() => {
    setInhaleLayerWords(getRandomWords(inhaleWords, wordsDisplayed));
    setExhaleLayerWords(getRandomWords(exhaleWords, wordsDisplayed));
  }, [inhaleWords, exhaleWords, wordsDisplayed]);

  // Cycle: refresh words for the *incoming* phase before it fades in
  useEffect(() => {
    const id = window.setInterval(() => {
      setPhase((prev) => {
        const next: Phase = prev === 'inhale' ? 'exhale' : 'inhale';
        if (next === 'inhale') setInhaleLayerWords(getRandomWords(inhaleWords, wordsDisplayed));
        else setExhaleLayerWords(getRandomWords(exhaleWords, wordsDisplayed));
        return next;
      });
    }, cycleDuration);

    return () => window.clearInterval(id);
  }, [cycleDuration, inhaleWords, exhaleWords, wordsDisplayed]);

  const isInhale = phase === 'inhale';
  const slots = wordsDisplayed * 2 + 1;

  // Animation shorter than full cycle for overlap
  const easing = 'cubic-bezier(0.33,0,0.67,1)';
  const animMs = Math.max(1400, Math.round(cycleDuration * 0.78));
  const layerInDelayMs = Math.round(cycleDuration * 0.06);

  const fogMask = useMemo(() => {
    // Opaque until ~72%, then soft fade out beyond 100% ("fog edge")
    return 'radial-gradient(130% 180% at 50% 50%, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 72%, rgba(0,0,0,0) 118%)';
  }, []);

  const slotMotion = useMemo<SlotMotion[]>(() => {
    const mid = Math.floor(slots / 2);
    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    return Array.from({ length: slots }, (_, i) => {
      const dist = Math.abs(i - mid);
      return {
        delayInMs: Math.round(dist * 90 + rand(0, 70)),
        delayOutMs: Math.round(dist * 60 + rand(0, 60)),
        inhale: { x: rand(-10, 10), y: rand(-6, 6), r: rand(-1.2, 1.2) },
        exhale: { x: rand(-10, 10), y: rand(-6, 6), r: rand(-1.2, 1.2) },
      };
    });
  }, [slots]);

  const getLayerWords = (type: Phase) => (type === 'inhale' ? inhaleLayerWords : exhaleLayerWords);

  const getMaskPosition = (type: Phase, active: boolean): string => {
    if (type === 'inhale') return active ? '48% 46%' : '43% 60%';
    return active ? '52% 54%' : '57% 40%';
  };

  const getMaskSize = (active: boolean): string => (active ? '190% 260%' : '85% 115%');

  const layerStyle = (type: Phase, isCurrent: boolean): React.CSSProperties => {
    const active = isCurrent;

    return {
      zIndex: active ? 2 : 1,
      opacity: active ? 1 : 0,
      filter: `blur(${active ? 0 : 18}px)`,
      transform: `translate3d(0, ${active ? 0 : 10}px, 0) scale(${active ? 1 : 0.985})`,
      transitionProperty:
        'opacity, transform, filter, -webkit-mask-position, -webkit-mask-size, mask-position, mask-size',
      transitionDuration: `${animMs}ms`,
      transitionTimingFunction: easing,
      transitionDelay: `${active ? layerInDelayMs : 0}ms`,
      WebkitMaskImage: fogMask,
      maskImage: fogMask,
      WebkitMaskRepeat: 'no-repeat',
      maskRepeat: 'no-repeat',
      WebkitMaskPosition: getMaskPosition(type, active),
      maskPosition: getMaskPosition(type, active),
      WebkitMaskSize: getMaskSize(active),
      maskSize: getMaskSize(active),
      willChange: 'opacity, transform, filter',
    };
  };

  const slotStyle = (type: Phase, slotIndex: number, isCurrent: boolean): React.CSSProperties => {
    const m = slotMotion[slotIndex];
    const base = type === 'inhale' ? m.inhale : m.exhale;

    const active = isCurrent;

    const x = active ? base.x : base.x * 1.6;
    const y = active ? base.y : base.y * 1.6 + 12;
    const r = active ? base.r : base.r * 1.4;

    return {
      opacity: active ? 1 : 0,
      filter: `blur(${active ? 0 : 10}px)`,
      transform: `translate3d(${x}px, ${y}px, 0) rotate(${r}deg)`,
      transitionProperty: 'opacity, transform, filter',
      transitionDuration: `${animMs}ms`,
      transitionTimingFunction: easing,
      transitionDelay: `${active ? m.delayInMs : m.delayOutMs}ms`,
      willChange: 'opacity, transform, filter',
    };
  };

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
                      `font-sans font-bold uppercase text-[10px] sm:text-xs md:text-sm ` +
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
                      `font-serif italic whitespace-nowrap ` +
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

  const transitionDuration = `${animMs}ms`;

  return (
    <section className="relative h-40 md:h-48 overflow-hidden flex flex-col justify-center items-center bg-brand-light border-y border-brand-green/5">
      {/* Gradient Masks */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-light to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-brand-light to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-brand-light via-brand-light/90 to-transparent z-10 pointer-events-none" />

      {/* Organic Breathing Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-5xl h-44 bg-brand-mint/25 blur-[110px] rounded-full"
          style={{
            transition: `transform ${transitionDuration} ${easing}, opacity ${transitionDuration} ${easing}`,
            transform: `translate(-50%, -50%) scale(${isInhale ? 1.12 : 0.86})`,
            opacity: isInhale ? 0.45 : 0.16,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden max-w-[1920px] mx-auto">
        {renderLayer('inhale')}
        {renderLayer('exhale')}
      </div>
    </section>
  );
};
