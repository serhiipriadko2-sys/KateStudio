import React from 'react';
import { Zap, Moon, Heart, Activity } from 'lucide-react';
import { FadeIn } from './FadeIn';

const benefitsData = [
  {
    icon: <Zap className="w-8 h-8 text-brand-green" />,
    title: "Энергия",
    desc: "Снятие усталости и заряд бодрости"
  },
  {
    icon: <Moon className="w-8 h-8 text-brand-green" />,
    title: "Спокойствие",
    desc: "Концентрация и внутренняя тишина"
  },
  {
    icon: <Heart className="w-8 h-8 text-brand-green" />,
    title: "Здоровье",
    desc: "Крепкий иммунитет и отличное самочувствие"
  },
  {
    icon: <Activity className="w-8 h-8 text-brand-green" />,
    title: "Тонус",
    desc: "Гибкость, сила и красивая осанка"
  }
];

export const Benefits: React.FC = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {benefitsData.map((item, index) => (
          <FadeIn key={index} delay={index * 100} direction="up">
            <div className="h-full flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-stone-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="mb-6 p-4 bg-brand-mint/30 rounded-full text-brand-green">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif text-brand-text mb-3">{item.title}</h3>
              <p className="text-brand-text/70 text-sm leading-relaxed font-light">{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};