import { ArrowDown } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import { FadeIn } from './FadeIn';
import { Image } from './Image';
import { Logo } from './Logo';

interface HeroProps {
  onBook: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onBook }) => {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const requestIds: number[] = [];
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const id = requestAnimationFrame(() => {
        if (parallaxRef.current)
          parallaxRef.current.style.transform = `translate3d(0, ${scrollY * 0.5}px, 0)`;
        if (indicatorRef.current) {
          const opacity = Math.max(0, 1 - scrollY / 300);
          indicatorRef.current.style.opacity = opacity.toString();
          indicatorRef.current.style.pointerEvents = opacity <= 0 ? 'none' : 'auto';
        }
      });
      requestIds.push(id);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      requestIds.forEach(cancelAnimationFrame);
    };
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] flex flex-col justify-end pb-24 px-6 md:px-12 overflow-hidden bg-brand-dark">
      <div ref={parallaxRef} className="absolute inset-0 z-0 will-change-transform">
        <Image
          src="/images/hero/hero-bg.jpg"
          alt="Yoga Pose"
          storageKey="hero-main-bg"
          containerClassName="w-full h-[120%] -top-[10%]"
          className="w-full h-full object-cover object-center brightness-[0.85]"
          controlsClassName="top-32 right-6 md:top-36 md:right-8"
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none z-10"></div>
      </div>

      <div className="relative z-20 w-full max-w-7xl mx-auto">
        <FadeIn delay={100} direction="down">
          <Logo className="w-28 h-28 mb-8" color="#fff" />
        </FadeIn>
        <FadeIn delay={300} direction="up">
          <h1 className="text-6xl md:text-[8rem] font-serif italic text-white leading-[0.85] mb-8 drop-shadow-lg mix-blend-overlay opacity-90">
            ЙОГА
          </h1>
        </FadeIn>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <FadeIn delay={500} direction="up" className="md:w-1/2">
            <div className="text-xl md:text-2xl text-white font-light tracking-wide border-l border-white/40 pl-6 py-1 backdrop-blur-sm">
              <p>Студия Кати Габран</p>
              <p className="text-white/80 text-base mt-1">Гармония тела и души в каждом движении</p>
            </div>
          </FadeIn>

          <FadeIn delay={700} direction="up">
            <button
              onClick={onBook}
              className="group relative inline-flex items-center justify-center w-full md:w-auto overflow-hidden rounded-full bg-white px-10 py-5 font-medium tracking-widest text-xs uppercase text-brand-dark shadow-2xl transition-all duration-300 hover:bg-brand-mint hover:scale-105 hover:shadow-brand-green/20"
            >
              <span className="relative z-10">Записаться на занятие</span>
              <div className="absolute inset-0 -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </button>
          </FadeIn>
        </div>
      </div>

      <div
        ref={indicatorRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 block transition-opacity duration-300"
      >
        <div
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="animate-bounce p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/80 hover:bg-white/20 transition-colors cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
};
