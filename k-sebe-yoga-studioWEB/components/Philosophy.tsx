import React from 'react';
import { FadeIn } from './FadeIn';

export const Philosophy: React.FC = () => {
  return (
    <section className="py-32 px-6 md:px-12 bg-white text-center border-t border-stone-100 relative overflow-hidden flex flex-col items-center">
      {/* Organic Breathing Background */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-green/5 rounded-full blur-[120px] animate-pulse"
        style={{ animationDuration: '8s' }}
      ></div>
      <div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-mint/20 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: '12s', animationDelay: '2s' }}
      ></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <FadeIn direction="up">
          <div className="inline-block mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-green border-b border-brand-green/20 pb-4">
              Наша философия
            </span>
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
              Это то, кто ты{' '}
              <span className="italic text-brand-green decoration-brand-mint underline decoration-2 underline-offset-8">
                есть
              </span>
              .
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

          {/* Part 2 of the text */}
          <FadeIn delay={1000} direction="up">
            <p className="text-stone-500 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Только твое дыхание, твой ритм и безопасное возвращение к самому себе через осознанное
              движение.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
