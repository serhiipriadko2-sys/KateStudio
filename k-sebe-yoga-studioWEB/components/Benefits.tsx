
import React from 'react';
import { Zap, Moon, Heart, Activity } from 'lucide-react';
import { FadeIn } from './FadeIn';

const benefitsData = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Энергия",
    desc: "Снятие усталости и мощный заряд бодрости на весь день"
  },
  {
    icon: <Moon className="w-6 h-6" />,
    title: "Спокойствие",
    desc: "Глубокая концентрация и внутренняя тишина в каждом моменте"
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Здоровье",
    desc: "Крепкий иммунитет, здоровое сердце и отличное самочувствие"
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Тонус",
    desc: "Гибкость, физическая сила и красивая, уверенная осанка"
  }
];

export const Benefits: React.FC = () => {
  return (
    <section className="py-24 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {benefitsData.map((item, index) => (
          <FadeIn key={index} delay={index * 100} direction="up" className="h-full">
            <div className="h-full flex flex-col items-start text-left p-8 bg-white rounded-[2rem] border border-stone-100 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-brand-green/30 transition-all duration-500 group relative overflow-hidden">
              {/* Subtle Gradient Background on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-mint/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="mb-6 p-4 bg-brand-mint/20 rounded-2xl text-brand-green group-hover:bg-brand-green group-hover:text-white transition-colors duration-500 shadow-inner relative z-10">
                {item.icon}
              </div>
              <h3 className="text-xl font-serif text-brand-text mb-3 group-hover:text-brand-green transition-colors relative z-10">{item.title}</h3>
              <p className="text-brand-text/60 text-sm leading-relaxed font-light relative z-10">
                {item.desc}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};
