import { Check } from 'lucide-react';
import React from 'react';
import { useToast } from '../context/ToastContext';
import { FadeIn } from './FadeIn';

const priceOptions = [
  {
    title: 'Разовое',
    price: '700 ₽',
    description: 'Для знакомства со студией',
    features: ['1 посещение', 'Коврик включен', 'Чай после практики', 'Срок: 7 дней'],
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
      'Срок: 30 дней',
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
      'Срок: 30 дней',
    ],
    isPopular: true,
  },
  {
    title: 'Индивидуально',
    price: '1 800 ₽',
    description: 'Персональный подход',
    features: ['Удобное время', 'Разбор техники', 'Индивидуальный подход', '1 человек'],
    isPopular: false,
    isDark: true,
  },
];

export const Pricing: React.FC = () => {
  const { showToast } = useToast();

  const handleSelect = (title: string, price: string) => {
    // Dispatch custom event for ChatWidget to catch
    const event = new CustomEvent('ksebe-open-chat', {
      detail: {
        message: `Здравствуйте! Я хочу приобрести абонемент "${title}" за ${price}. Как это сделать?`,
      },
    });
    window.dispatchEvent(event);
    showToast('Переходим в чат для оформления...', 'success');
  };

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {priceOptions.map((option, idx) => (
          <FadeIn key={idx} delay={idx * 150} direction="up" className="h-full">
            <div
              className={`
                h-full relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.02] overflow-hidden
                ${option.isPopular ? 'border-2 border-brand-green shadow-xl bg-white scale-[1.02] z-10' : ''}
                ${option.isDark ? 'bg-[#1a1a1a] text-white shadow-xl' : 'bg-white border border-stone-100'}
              `}
            >
              {option.isPopular && (
                <>
                  {/* Refined Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] animate-shimmer pointer-events-none z-0 opacity-40"></div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-green text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg z-20">
                    Хит продаж
                  </div>
                </>
              )}

              <div className="mb-8 relative z-10">
                <h3
                  className={`text-xl font-serif mb-2 ${option.isDark ? 'text-white' : 'text-brand-text'}`}
                >
                  {option.title}
                </h3>
                <p className={`text-sm ${option.isDark ? 'text-white/50' : 'text-stone-400'}`}>
                  {option.description}
                </p>
              </div>

              <div className="mb-8 relative z-10">
                <span className="text-4xl font-serif">{option.price}</span>
              </div>

              <ul className="space-y-4 mb-10 flex-1 relative z-10">
                {option.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-sm">
                    <div
                      className={`mt-0.5 min-w-[16px] ${option.isDark ? 'text-brand-green' : 'text-brand-green'}`}
                    >
                      <Check className="w-4 h-4" />
                    </div>
                    <span className={option.isDark ? 'text-white/80' : 'text-brand-text/70'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelect(option.title, option.price)}
                className={`
                w-full py-4 rounded-xl font-medium transition-all duration-300 text-sm tracking-wide uppercase relative z-10
                ${
                  option.isDark
                    ? 'bg-brand-green text-white hover:bg-brand-green/90'
                    : option.isPopular
                      ? 'bg-brand-green text-white hover:bg-brand-green/90 shadow-lg shadow-brand-green/30'
                      : 'bg-stone-50 text-brand-text hover:bg-stone-100'
                }
              `}
              >
                Выбрать
              </button>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};
