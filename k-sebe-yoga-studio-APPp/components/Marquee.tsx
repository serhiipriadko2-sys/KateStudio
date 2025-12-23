import React, { useState, useEffect } from 'react';

const inhaleConcepts = ['Вдохновение', 'Энергия', 'Расширение', 'Жизнь'];
const exhaleConcepts = ['Освобождение', 'Тишина', 'Заземление', 'Баланс'];

export const Marquee: React.FC = () => {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');

  useEffect(() => {
    // 5s breath cycle (slower, deeper yoga breath)
    const interval = setInterval(() => {
      setPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const renderLayer = (type: 'inhale' | 'exhale') => {
    const isCurrent = phase === type;
    const actionWord = type === 'inhale' ? 'ВДОХ' : 'ВЫДОХ';
    const concepts = type === 'inhale' ? inhaleConcepts : exhaleConcepts;

    return (
      <div
        className={`
          absolute inset-0 w-full flex justify-between items-center px-4 md:px-12 max-w-[1400px] mx-auto 
          transition-all duration-[4800ms] ease-[cubic-bezier(0.4,0,0.2,1)] will-change-[opacity,transform,filter]
          ${isCurrent ? 'opacity-100 blur-0 scale-100 z-10' : 'opacity-0 blur-md scale-90 z-0'}
        `}
      >
        {Array.from({ length: 7 }).map((_, i) => {
          // Reduced count for cleaner look on mobile
          const isAction = i % 2 === 0;
          const conceptIndex = Math.floor(i / 2) % concepts.length;

          return (
            <div key={i} className="flex-1 flex justify-center text-center">
              {isAction ? (
                <div
                  className={`
                    flex flex-col items-center justify-center transition-all duration-[4800ms]
                    ${type === 'inhale' ? 'tracking-[0.5em]' : 'tracking-[0.1em]'}
                 `}
                >
                  <span
                    className={`
                      font-sans font-bold uppercase text-[10px] sm:text-xs md:text-sm
                      ${
                        type === 'inhale'
                          ? 'text-brand-green/80 drop-shadow-[0_0_8px_rgba(87,167,115,0.3)]'
                          : 'text-stone-300'
                      }
                   `}
                  >
                    {actionWord}
                  </span>
                  {type === 'inhale' && (
                    <div className="w-1 h-1 bg-brand-green rounded-full mt-2 animate-ping" />
                  )}
                </div>
              ) : (
                <span
                  className={`
                    font-serif italic transition-all duration-[4800ms]
                    text-base sm:text-xl md:text-3xl whitespace-nowrap
                    ${
                      type === 'inhale'
                        ? 'text-brand-text font-normal translate-y-0'
                        : 'text-stone-300 font-light translate-y-2'
                    }
                 `}
                >
                  {concepts[conceptIndex]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative w-full h-40 md:h-48 overflow-hidden bg-transparent pointer-events-none select-none flex items-center justify-center my-8">
      {/* Organic Gradient Pulse Background */}
      <div
        className={`
        absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-full
        bg-gradient-to-r from-transparent via-brand-mint/20 to-transparent
        blur-3xl rounded-[100%]
        transition-all duration-[4800ms] ease-in-out
        ${phase === 'inhale' ? 'opacity-100 scale-x-110' : 'opacity-20 scale-x-75'}
      `}
      ></div>

      {/* Breathing Container */}
      <div className="w-full h-full relative flex items-center">
        {renderLayer('inhale')}
        {renderLayer('exhale')}
      </div>
    </div>
  );
};
