
import React, { useState, useEffect } from 'react';
import { FadeIn } from './FadeIn';

const INHALE_WORDS = ["Свет", "Любовь", "Энергия", "Поток"];
const EXHALE_WORDS = ["Тишина", "Покой", "Баланс", "Мягкость"];

export const Philosophy: React.FC = () => {
  const [isInhale, setIsInhale] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsInhale(prev => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const breathingTransition = "transition-all duration-[4000ms] ease-[cubic-bezier(0.4,0,0.2,1)]";

  const renderStrip = (words: string[], label: string, isActive: boolean) => (
    <div className={`
        absolute inset-0 flex items-center justify-center w-full
        gap-6 sm:gap-12 md:gap-24 px-4
        ${breathingTransition}
        ${isActive ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-95'}
    `}>
        {/* Pattern: Label - Word - Label - Word - Label - Word - Label - Word - Label (Total 9 elements) */}
        
        <span className={`
            text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-green/60 shrink-0
            ${breathingTransition}
            ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
        `}>
            {label}
        </span>

        {words.slice(0, 4).map((word, i) => (
            <React.Fragment key={i}>
                <span className={`
                    text-xl sm:text-2xl md:text-4xl font-serif text-brand-text/90 whitespace-nowrap shrink-0
                    ${breathingTransition}
                    ${isActive ? 'tracking-normal' : 'tracking-wide'}
                `}>
                    {word}
                </span>
                
                <span className={`
                    text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] text-brand-green/60 shrink-0
                    ${breathingTransition}
                    ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
                `}>
                    {label}
                </span>
            </React.Fragment>
        ))}
    </div>
  );

  return (
    <section className="py-32 px-6 md:px-12 bg-white text-center border-t border-stone-100 relative overflow-hidden flex flex-col items-center">
      {/* Organic Breathing Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-mint/20 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <FadeIn direction="up">
           <div className="inline-block mb-12">
             <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-green border-b border-brand-green/20 pb-4">Наша философия</span>
           </div>
        </FadeIn>
        
        <div className="space-y-2 mb-16">
            <FadeIn delay={200} direction="up">
                <h3 className="text-3xl md:text-5xl lg:text-7xl font-serif text-brand-text leading-[1.1] mb-2">
                  Йога — это не то,
                </h3>
            </FadeIn>
            <FadeIn delay={400} direction="up">
                <h3 className="text-3xl md:text-5xl lg:text-7xl font-serif text-brand-text leading-[1.1] mb-2">
                  кем ты <span className="italic text-brand-green">становишься</span>.
                </h3>
            </FadeIn>
            <FadeIn delay={600} direction="up">
                <h3 className="text-3xl md:text-5xl lg:text-7xl font-serif text-brand-text leading-[1.1]">
                  Это то, кто ты <span className="italic text-brand-green decoration-brand-mint underline decoration-2 underline-offset-8">есть</span>.
                </h3>
            </FadeIn>
        </div>
        
        <div className="flex flex-col items-center">
            {/* Part 1 of the text */}
            <FadeIn delay={800} direction="up">
                <p className="text-stone-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-10">
                Мы создали пространство, где нет конкуренции и достигаторства. 
                </p>
            </FadeIn>

            {/* Breathing Animation Strip - Interjected */}
            <FadeIn delay={1000} className="w-full relative z-10 mb-10">
                <div className="relative h-24 md:h-36 w-full overflow-hidden flex flex-col justify-center items-center">
                    {/* Gradient Masks (White to match section bg) */}
                    <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-y-0 left-0 w-8 md:w-24 bg-gradient-to-r from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute inset-y-0 right-0 w-8 md:w-24 bg-gradient-to-l from-white via-white/90 to-transparent z-10 pointer-events-none"></div>

                    {/* Strip Content */}
                    <div className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
                        {renderStrip(INHALE_WORDS, "Вдох", isInhale)}
                        {renderStrip(EXHALE_WORDS, "Выдох", !isInhale)}
                    </div>
                </div>
            </FadeIn>

            {/* Part 2 of the text */}
            <FadeIn delay={1200} direction="up">
                <p className="text-stone-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                Только твое дыхание, твой ритм и безопасное возвращение к самому себе через осознанное движение.
                </p>
            </FadeIn>
        </div>
      </div>

    </section>
  );
};
