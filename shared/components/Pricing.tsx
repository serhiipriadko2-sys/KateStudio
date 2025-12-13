/**
 * Pricing Component - Unified
 * Shared across WEB and APP
 * Supports both callback patterns: onBook prop and CustomEvent
 */
import React from 'react';
import { Check, Star, ArrowRight } from 'lucide-react';
import { FadeIn } from './FadeIn';
import { PriceOption } from '../types';

// Default pricing options
const defaultPriceOptions: PriceOption[] = [
  {
    title: 'Разовое',
    price: '800 ₽',
    description: 'Для знакомства со студией',
    features: [
      '1 посещение любой практики',
      'Коврик включен',
      'Чай после практики',
      'Срок действия: 7 дней',
    ],
    isPopular: false,
  },
  {
    title: '4 занятия',
    price: '2 800 ₽',
    description: 'Для регулярной практики',
    features: [
      '700 ₽ за занятие',
      'Заморозка на 7 дней',
      'Скидка 10% на мастер-классы',
      'Срок действия: 30 дней',
    ],
    isPopular: false,
  },
  {
    title: '8 занятий',
    price: '5 200 ₽',
    description: 'Выгодный выбор',
    features: [
      '650 ₽ за занятие',
      'Заморозка на 14 дней',
      'Гостевой визит для друга',
      'Срок действия: 45 дней',
    ],
    isPopular: true,
  },
  {
    title: 'Индивидуально',
    price: '3 500 ₽',
    description: 'Персональный подход',
    features: ['Удобное время', 'Разбор техники асан', 'План питания', 'Поддержка в мессенджере'],
    isPopular: false,
    isDark: true,
  },
];

interface PricingProps {
  options?: PriceOption[];
  onBook?: (plan: string, price: string) => void;
  useCustomEvent?: boolean;
  customEventName?: string;
  className?: string;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Pricing: React.FC<PricingProps> = ({
  options = defaultPriceOptions,
  onBook,
  useCustomEvent = false,
  customEventName = 'ksebe-open-chat',
  className = '',
  showToast,
}) => {
  const handleSelect = (title: string, price: string) => {
    // Priority 1: Use onBook callback if provided
    if (onBook) {
      onBook(title, price);
      return;
    }

    // Priority 2: Use CustomEvent if enabled (for APP compatibility)
    if (useCustomEvent) {
      const event = new CustomEvent(customEventName, {
        detail: {
          message: `Здравствуйте! Я хочу приобрести абонемент "${title}" за ${price}. Как это сделать?`,
        },
      });
      window.dispatchEvent(event);
      showToast?.('Переходим в чат для оформления...', 'success');
      return;
    }

    // Fallback: console log
    console.log(`Selected: ${title} - ${price}`);
  };

  return (
    <section
      id="pricing"
      className={`py-24 px-4 md:px-12 max-w-7xl mx-auto scroll-mt-20 ${className}`}
    >
      <div className="text-center mb-16">
        <FadeIn>
          <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
            Абонементы
          </h4>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Стоимость</h2>
        </FadeIn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {options.map((option, idx) => (
          <FadeIn key={idx} delay={idx * 150} direction="up" className="h-full">
            <div
              className={`
                h-full relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-500 group overflow-hidden
                ${option.isPopular ? 'border-2 border-brand-green shadow-2xl bg-white lg:-mt-4 lg:mb-4 lg:py-10 z-10 hover:shadow-brand-green/20' : ''}
                ${option.isDark ? 'bg-[#1a1a1a] text-white shadow-xl hover:shadow-2xl hover:shadow-black/20' : ''}
                ${!option.isPopular && !option.isDark ? 'bg-white border border-stone-100 hover:border-brand-green/30 hover:shadow-xl' : ''}
              `}
            >
              {/* Shimmer effect for popular */}
              {option.isPopular && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] animate-shimmer pointer-events-none z-0 opacity-40" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-green text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1 z-20">
                    <Star className="w-3 h-3 fill-current" /> Хит продаж
                  </div>
                </>
              )}

              <div className="mb-6 relative z-10">
                <h3
                  className={`text-xl font-serif mb-2 group-hover:translate-x-1 transition-transform ${option.isDark ? 'text-white' : 'text-brand-text'}`}
                >
                  {option.title}
                </h3>
                <p className={`text-sm ${option.isDark ? 'text-white/50' : 'text-stone-400'}`}>
                  {option.description}
                </p>
              </div>

              <div className="mb-8 relative z-10">
                <span
                  className={`text-4xl font-serif tracking-tight ${option.isDark ? 'text-brand-green' : 'text-brand-text'}`}
                >
                  {option.price}
                </span>
                {option.isPopular && (
                  <span className="absolute -right-2 top-0 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-green" />
                  </span>
                )}
              </div>

              <ul className="space-y-4 mb-10 flex-1 relative z-10">
                {option.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3 text-sm group/item">
                    <div
                      className={`mt-0.5 min-w-[16px] transition-transform group-hover/item:scale-110 text-brand-green`}
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
                onClick={() => handleSelect(option.title, option.price)}
                className={`
                  w-full py-4 rounded-xl font-medium transition-all duration-300 text-sm tracking-wide uppercase
                  flex items-center justify-center gap-2 group/btn relative overflow-hidden z-10
                  ${
                    option.isDark
                      ? 'bg-brand-green text-white hover:bg-brand-green/90'
                      : option.isPopular
                        ? 'bg-brand-green text-white hover:bg-brand-green/90 shadow-lg shadow-brand-green/30'
                        : 'bg-stone-50 text-brand-text hover:bg-stone-100 hover:text-brand-green'
                  }
                `}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span>Выбрать</span>
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                </span>
                {option.isPopular && (
                  <div className="absolute inset-0 -translate-x-[100%] group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
                )}
              </button>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
