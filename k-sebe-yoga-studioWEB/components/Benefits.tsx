import { Zap, Moon, Heart, Activity } from 'lucide-react';
import React from 'react';
import { FadeIn } from './FadeIn';

const benefitsData = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Энергия',
    desc: 'Снятие усталости и мощный заряд бодрости',
  },
  {
    icon: <Moon className="w-5 h-5" />,
    title: 'Спокойствие',
    desc: 'Глубокая концентрация и внутренняя тишина',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: 'Здоровье',
    desc: 'Крепкий иммунитет и отличное самочувствие',
  },
  {
    icon: <Activity className="w-5 h-5" />,
    title: 'Тонус',
    desc: 'Гибкость, физическая сила и красивая осанка',
  },
];

export const Benefits: React.FC = () => {
  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-br from-brand-mint/10 to-brand-green/5 p-6 rounded-3xl border border-brand-green/10">
        {benefitsData.map((item, index) => (
          <FadeIn key={index} delay={index * 100} direction="up" className="h-full">
            <div className="h-full flex items-start text-left p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-stone-100/50 hover:shadow-lg hover:border-brand-green/30 hover:bg-white transition-all duration-300 group">
              <div className="flex-shrink-0 mr-4 p-3 bg-brand-mint/30 rounded-xl text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors duration-300">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-serif text-brand-text mb-1 group-hover:text-brand-green transition-colors">
                  {item.title}
                </h3>
                <p className="text-brand-text/60 text-sm leading-snug font-light">{item.desc}</p>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};
