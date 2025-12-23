import { Shirt, Clock, HeartHandshake, ArrowRight } from 'lucide-react';
import React from 'react';
import { FadeIn } from './FadeIn';

interface FirstVisitProps {
  onBook: () => void;
}

export const FirstVisit: React.FC<FirstVisitProps> = ({ onBook }) => {
  const steps = [
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Приходите заранее',
      text: 'Постарайтесь прийти за 15 минут до начала. Это время нужно, чтобы спокойно переодеться и настроиться.',
      id: '01',
    },
    {
      icon: <Shirt className="w-6 h-6" />,
      title: 'Удобная одежда',
      text: 'Вам подойдет любая одежда, не стесняющая движений. Обувь не нужна — мы занимаемся босиком.',
      id: '02',
    },
    {
      icon: <HeartHandshake className="w-6 h-6" />,
      title: 'Мы рядом',
      text: 'Если у вас есть травмы или вы впервые, обязательно скажите преподавателю. Мы подберем безопасные вариации.',
      id: '03',
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-t border-stone-100">
      <div className="bg-brand-mint/20 rounded-[3rem] p-8 md:p-16 relative overflow-hidden">
        {/* Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl"></div>

        <FadeIn>
          <div className="text-center mb-16 relative z-10 flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="text-left">
              <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
                Новичкам
              </h4>
              <h2 className="text-3xl md:text-5xl font-serif text-brand-text/90">
                Ваш первый визит
              </h2>
            </div>

            <button
              onClick={onBook}
              className="bg-white text-brand-green px-8 py-4 rounded-xl font-medium shadow-sm hover:shadow-lg hover:bg-brand-green hover:text-white transition-all duration-300 flex items-center gap-2 group whitespace-nowrap"
            >
              <span>Записаться на класс</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {steps.map((step, idx) => (
            <FadeIn key={idx} delay={idx * 150} direction="up" className="h-full">
              <div className="relative h-full flex flex-col p-6 bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 hover:bg-white transition-colors duration-300 group">
                {/* Large Background Number */}
                <span className="absolute -top-4 -right-2 text-8xl font-serif text-brand-green/5 font-bold pointer-events-none select-none group-hover:text-brand-green/10 transition-colors">
                  {step.id}
                </span>

                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-green shadow-sm mb-6 relative z-10">
                  {step.icon}
                </div>
                <h3 className="text-xl font-serif text-brand-text mb-3 relative z-10">
                  {step.title}
                </h3>
                <p className="text-brand-text/70 text-sm leading-relaxed font-light relative z-10">
                  {step.text}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
