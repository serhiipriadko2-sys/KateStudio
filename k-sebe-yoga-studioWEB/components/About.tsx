import React from 'react';
import { FadeIn } from './FadeIn';
import { Image } from './Image';

export const About: React.FC = () => {
  return (
    <section id="about" className="py-24 px-6 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-5/12 relative group w-full">
          <FadeIn delay={0} direction="right">
            <div className="absolute inset-0 bg-brand-mint rounded-[3rem] rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
            <div className="relative w-full aspect-[3/4] rounded-[3rem] overflow-hidden shadow-xl">
              <Image
                src={`${import.meta.env.BASE_URL}images/about/katya-portrait.jpg`}
                alt="Катя Габран"
                storageKey="about-katya-portrait"
                containerClassName="w-full h-full"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </FadeIn>
        </div>

        <div className="md:w-7/12 md:pl-10 text-center md:text-left">
          <FadeIn delay={200}>
            <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
              Обо мне
            </h4>
          </FadeIn>

          <FadeIn delay={300}>
            <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90 mb-10">
              Привет, я Катя
            </h2>
          </FadeIn>

          <FadeIn delay={400}>
            <div className="space-y-6 text-brand-text/80 text-lg md:text-xl font-light leading-relaxed">
              <p>
                Преподаватель, всем сердцем влюбленный в{' '}
                <span className="font-serif italic text-2xl text-brand-green mx-1">
                  Inside Flow
                </span>{' '}
                и{' '}
                <span className="font-serif italic text-2xl text-brand-green mx-1">Хатха-йогу</span>
                .
              </p>
              <p>
                Каждое наше занятие станет твоим путешествием в глубину внутреннего покоя, туда, где
                живет гармония с собой и своим телом.
              </p>
              <p>
                Для меня йога — это не просто асаны. Это умение чувствовать себя в моменте, это
                забота о внешнем и внутреннем.
              </p>
            </div>
          </FadeIn>

          {/* Statistics / Social Proof */}
          <FadeIn delay={500}>
            <div className="grid grid-cols-3 gap-4 md:gap-8 mt-12 pt-8 border-t border-brand-green/10">
              <div>
                <div className="text-3xl md:text-4xl font-serif text-brand-green mb-1">8+</div>
                <div className="text-xs uppercase tracking-wider text-stone-400 font-bold">
                  Лет практики
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif text-brand-green mb-1">1k+</div>
                <div className="text-xs uppercase tracking-wider text-stone-400 font-bold">
                  Счастливых учеников
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif text-brand-green mb-1">15</div>
                <div className="text-xs uppercase tracking-wider text-stone-400 font-bold">
                  Ретритов
                </div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={600}>
            <div className="mt-10">
              <img
                src="/signature.png"
                alt="Signature"
                className="h-16 opacity-50 mx-auto md:mx-0 mix-blend-multiply"
              />
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};
