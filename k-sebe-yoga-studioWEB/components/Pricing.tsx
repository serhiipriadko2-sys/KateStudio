import { Check, Star, ArrowRight } from 'lucide-react';
import React from 'react';
import { FadeIn } from './FadeIn';

interface PricingProps {
  onBook: (plan: string, price: string) => void;
}

const priceOptions = [
  {
    title: 'Разовое',
    price: '700 ₽',
    description: 'Для знакомства со студией',
    features: [
      '1 посещение любой практики',
      'Срок действия: 7 дней',
    ],
    isPopular: false,
  },
  {
    title: '4 занятия',
    price: '2 500 ₽',
    description: 'Срок 1 месяц с первого посещения',
    features: [
      '625 ₽ за занятие',
      '4 посещения',
      'Экономия 300 ₽',
      'Срок действия: 30 дней',
    ],
    isPopular: false,
  },
  {
    title: '9 занятий',
    price: '5 000 ₽',
    description: 'Срок 1 месяц с первого посещения',
    features: [
      '556 ₽ за занятие',
      '9 посещений',
      'Экономия 1 300 ₽',
      'Срок действия: 30 дней',
    ],
    isPopular: true,
  },
  {
    title: 'Индивидуально',
    price: '1 800 ₽',
    description: 'Персональный подход',
    features: ['Удобное время', 'Индивидуальный подход', '1 человек'],
    isPopular: false,
    isDark: true,
  },
];

export const Pricing: React.FC<PricingProps> = ({ onBook }) => {
  return (
    <section id="pricing" className="py-24 px-4 md:px-12 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center mb-16">
        <FadeIn>
          <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
            Абонементы
          </h4>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Стоимость</h2>
        </FadeIn>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {priceOptions.map((option, idx) => (
          <FadeIn key={idx} delay={idx * 150} direction="up" className="h-full">
            <div
              className={`h-full relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-500 group ${option.isPopular ? 'border-2 border-brand-green shadow-2xl bg-white lg:-mt-4 lg:mb-4 lg:py-10 z-10 hover:shadow-brand-green/20' : ''} ${option.isDark ? 'bg-[#1a1a1a] text-white shadow-xl hover:shadow-2xl hover:shadow-black/20' : !option.isPopular ? 'bg-white border border-stone-100 hover:border-brand-green/30 hover:shadow-xl' : ''}`}
            >
              {option.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-green text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" /> Хит продаж
                </div>
              )}
              <div className="mb-6">
                <h3
                  className={`text-xl font-serif mb-2 group-hover:translate-x-1 transition-transform ${option.isDark ? 'text-white' : 'text-brand-text'}`}
                >
                  {option.title}
                </h3>
                <p className={`text-sm ${option.isDark ? 'text-white/50' : 'text-stone-400'}`}>
                  {option.description}
                </p>
              </div>
              <div className="mb-8 relative">
                <span
                  className={`text-4xl font-serif tracking-tight ${option.isDark ? 'text-brand-green' : 'text-brand-text'}`}
                >
                  {option.price}
                </span>
                {option.isPopular && (
                  <span className="absolute -right-2 top-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-green"></span>
                  </span>
                )}
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {option.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-sm group/item">
                    <div
                      className={`mt-0.5 min-w-[16px] transition-transform group-hover/item:scale-110 ${option.isDark ? 'text-brand-green' : 'text-brand-green'}`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                    <span
                      className={`transition-colors ${option.isDark ? 'text-white/80 group-hover:text-white' : 'text-brand-text/70 group-hover:text-brand-text'}`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onBook(option.title, option.price)}
                className={`w-full py-4 rounded-xl font-medium transition-all duration-300 text-sm tracking-wide uppercase flex items-center justify-center gap-2 group/btn relative overflow-hidden ${option.isDark ? 'bg-brand-green text-white hover:bg-brand-green/90' : option.isPopular ? 'bg-brand-green text-white hover:bg-brand-green/90 shadow-lg shadow-brand-green/30' : 'bg-stone-50 text-brand-text hover:bg-stone-100 hover:text-brand-green'}`}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Выбрать</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </span>
                {option.isPopular && (
                  <div className="absolute inset-0 -translate-x-[100%] group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0"></div>
                )}
              </button>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};
