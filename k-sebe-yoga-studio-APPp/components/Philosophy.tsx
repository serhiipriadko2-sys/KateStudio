
import React from 'react';
import { FadeIn } from './FadeIn';
import { Marquee } from './Marquee';

export const Philosophy: React.FC = () => {
  return (
    <section className="py-24 bg-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-stone-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-mint/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
        <FadeIn>
            <div className="flex flex-col items-center gap-4 mb-14">
                <span className="px-4 py-1.5 rounded-full border border-brand-green/20 text-brand-green tracking-[0.2em] text-[10px] font-bold uppercase bg-white">
                    Философия
                </span>
            </div>
        </FadeIn>

        <FadeIn delay={200}>
            <h2 className="text-4xl md:text-6xl font-serif text-brand-text leading-[1.15] mb-8">
            Йога — это не то,<br className="hidden md:block" />
            кем ты <span className="text-brand-green italic font-normal relative inline-block">
              становишься
              <svg className="absolute -bottom-2 left-0 w-full h-2 text-brand-green/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </span>.
            </h2>
        </FadeIn>
      </div>

      {/* Animation placed between paragraphs */}
      <div className="w-full relative z-0">
         <Marquee />
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
         <FadeIn delay={300}>
             <h2 className="text-4xl md:text-6xl font-serif text-brand-text leading-[1.15] mb-12">
              Это то, кто ты <span className="text-brand-green italic font-normal border-b-2 border-brand-green/30 pb-1">есть</span>.
            </h2>
         </FadeIn>

        <FadeIn delay={400}>
            <p className="text-stone-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto mb-16">
            Мы создали пространство, где нет конкуренции и достигаторства. 
            Только твое дыхание, твой ритм и безопасное возвращение к самому себе через осознанное движение.
            </p>
        </FadeIn>

        <FadeIn delay={500}>
            <div className="flex flex-col items-center justify-center gap-4">
                 <img src="/signature.png" alt="Signature" className="h-20 opacity-60 mix-blend-multiply transform -rotate-2" />
                 <div>
                   <p className="text-sm font-bold text-brand-text uppercase tracking-widest">Катя Габран</p>
                   <p className="text-xs text-stone-400 font-serif italic mt-1">Основатель студии</p>
                 </div>
            </div>
        </FadeIn>
      </div>
    </section>
  );
};
