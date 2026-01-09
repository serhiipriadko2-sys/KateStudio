import { Zap, Moon, Heart, Activity } from 'lucide-react';
import React from 'react';
import { FadeIn } from './FadeIn';

const benefitsData = [
  {
    icon: <Zap className="w-5 h-5 text-brand-green" />,
    title: 'Энергия',
    desc: 'Снятие усталости и заряд бодрости',
  },
  {
    icon: <Moon className="w-5 h-5 text-brand-green" />,
    title: 'Спокойствие',
    desc: 'Концентрация и внутренняя тишина',
  },
  {
    icon: <Heart className="w-5 h-5 text-brand-green" />,
    title: 'Здоровье',
    desc: 'Крепкий иммунитет и отличное самочувствие',
  },
  {
    icon: <Activity className="w-5 h-5 text-brand-green" />,
    title: 'Тонус',
    desc: 'Гибкость, сила и красивая осанка',
  },
];

export const Benefits: React.FC = () => {
  return (
    <section className="py-16 px-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-br from-brand-mint/10 to-brand-green/5 p-5 rounded-3xl border border-brand-green/10">
        {benefitsData.map((item, index) => (
          <FadeIn key={index} delay={index * 100} direction="up">
            <div className="h-full flex items-start text-left p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-100/50 hover:shadow-lg hover:border-brand-green/30 hover:bg-white transition-all duration-300">
              <div className="flex-shrink-0 mr-3 p-2.5 bg-brand-mint/30 rounded-xl">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-serif text-brand-text mb-1">{item.title}</h3>
                <p className="text-brand-text/70 text-sm leading-snug font-light">{item.desc}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};
