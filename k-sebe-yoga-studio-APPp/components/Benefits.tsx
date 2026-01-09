import { Zap, Moon, Heart, Activity, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleBenefit = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="py-8 px-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-center gap-3">
        {benefitsData.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={index}
              onClick={() => toggleBenefit(index)}
              className={`
                flex flex-col items-center
                px-5 py-3 border transition-all duration-300
                min-w-[140px]
                ${
                  isActive
                    ? 'bg-brand-green/10 border-brand-green/40 rounded-2xl'
                    : 'bg-brand-mint/20 border-brand-green/20 rounded-full'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {item.icon}
                <span className="font-medium text-brand-green">{item.title}</span>
                <ChevronDown
                  className={`w-4 h-4 text-brand-green transition-transform duration-300 ${
                    isActive ? 'rotate-180' : ''
                  }`}
                />
              </div>

              {/* Expandable description */}
              <div
                className={`
                  overflow-hidden transition-all duration-300
                  ${isActive ? 'max-h-20 mt-2 opacity-100' : 'max-h-0 opacity-0'}
                `}
              >
                <p className="text-sm text-stone-500 text-center">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
