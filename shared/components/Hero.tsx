import React from 'react';
import { BRAND, COLORS } from '../constants';
import { FadeIn } from './FadeIn';
import { Image } from './Image';
import { Logo } from './Logo';

interface HeroProps {
  onBook?: () => void;
  showScrollIndicator?: boolean;
}

export const Hero: React.FC<HeroProps> = ({ onBook, showScrollIndicator = true }) => {
  return (
    <section className="relative h-screen min-h-[600px] flex flex-col justify-end pb-24 px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/hero-bg.jpg"
          alt="Yoga Pose"
          className="w-full h-full object-cover object-center brightness-[0.85]"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-10"></div>
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto pointer-events-none">
        <FadeIn delay={100} direction="down">
          <div className="pointer-events-auto inline-block">
            <Logo className="w-28 h-28 mb-8" color="#fff" />
          </div>
        </FadeIn>

        <FadeIn delay={300} direction="up">
          <h1 className="text-6xl md:text-[8rem] font-serif italic text-white leading-[0.85] mb-8 drop-shadow-lg uppercase">
            Йога
          </h1>
        </FadeIn>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <FadeIn delay={500} direction="up" className="md:w-1/2">
            <div className="text-xl md:text-2xl text-white font-light tracking-wide border-l border-white/40 pl-6 py-1 backdrop-blur-sm">
              <p>Студия {BRAND.founder}</p>
              <p className="text-white/80 text-base mt-1">Гармония тела и души в каждом движении</p>
            </div>
          </FadeIn>

          <FadeIn delay={700} direction="up">
            <button
              onClick={onBook}
              className="pointer-events-auto inline-block w-full md:w-auto text-center bg-white text-brand-dark font-medium tracking-widest text-xs uppercase py-5 px-10 rounded-full hover:bg-brand-mint transition-colors duration-300 shadow-xl shadow-black/10"
            >
              Записаться на занятие
            </button>
          </FadeIn>
        </div>
      </div>
      
      {showScrollIndicator && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce text-white/50">
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent mx-auto"></div>
        </div>
      )}
    </section>
  );
};