import { Shirt, Clock, HeartHandshake } from 'lucide-react';
import React from 'react';
import { FadeIn } from './FadeIn';

export const FirstVisit: React.FC = () => {
  const steps = [
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Приходите заранее',
      text: 'Постарайтесь прийти за 15 минут до начала. Это время нужно, чтобы спокойно переодеться, познакомиться с пространством и настроиться на практику.',
    },
    {
      icon: <Shirt className="w-8 h-8" />,
      title: 'Удобная одежда',
      text: 'Вам подойдет любая одежда, не стесняющая движений. Обувь не нужна — мы занимаемся босиком. Коврики и полотенца есть в студии.',
    },
    {
      icon: <HeartHandshake className="w-8 h-8" />,
      title: 'Мы рядом',
      text: 'Если у вас есть травмы или вы впервые, обязательно скажите преподавателю перед занятием. Мы подберем для вас безопасные вариации асан.',
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-t border-stone-100">
      <div className="bg-brand-mint/20 rounded-[3rem] p-8 md:p-16">
        <FadeIn>
          <div className="text-center mb-12">
            <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
              Новичкам
            </h4>
            <h2 className="text-3xl md:text-5xl font-serif text-brand-text/90">Ваш первый визит</h2>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, idx) => (
            <FadeIn key={idx} delay={idx * 150} direction="up">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-brand-green shadow-sm mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-serif text-brand-text mb-3">{step.title}</h3>
                <p className="text-brand-text/70 text-sm leading-relaxed font-light">{step.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
