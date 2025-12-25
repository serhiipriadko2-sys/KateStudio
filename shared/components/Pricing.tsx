/**
 * Pricing Component - Unified
 * Shared across WEB and APP
 * Supports both callback patterns: onBook prop and CustomEvent
 */
import { Check, Star, ArrowRight } from 'lucide-react';
import React from 'react';
import { PriceOption } from '../types';
import { FadeIn } from './FadeIn';

// Yoga subscriptions
const yogaSubscriptions: PriceOption[] = [
  {
    title: 'Разовое',
    price: '700 ₽',
    description: 'Для знакомства со студией',
    features: ['1 посещение любой практики', 'Срок действия: 7 дней'],
    isPopular: false,
  },
  {
    title: '4 занятия',
    price: '2 500 ₽',
    description: 'Срок 1 месяц с первого посещения',
    features: ['625 ₽ за занятие', '4 посещения', 'Экономия 300 ₽', 'Срок действия: 30 дней'],
    isPopular: false,
  },
  {
    title: '9 занятий',
    price: '5 000 ₽',
    description: 'Срок 1 месяц с первого посещения',
    features: ['556 ₽ за занятие', '9 посещений', 'Экономия 1 300 ₽', 'Срок действия: 30 дней'],
    isPopular: true,
  },
];

// Personal training
const personalTraining: PriceOption[] = [
  {
    title: 'Персональная (1 чел)',
    price: '1 800 ₽',
    description: 'Индивидуальный подход',
    features: ['Удобное время', 'Индивидуальный подход', '1 человек'],
    isPopular: false,
    isDark: true,
  },
  {
    title: 'Персональная (2 чел)',
    price: '2 500 ₽',
    description: 'Занятие для двоих',
    features: ['Удобное время', 'Индивидуальный подход', '2 человека'],
    isPopular: false,
    isDark: true,
  },
];

// Sound Healing
const soundHealing: PriceOption[] = [
  {
    title: 'Групповая сессия',
    price: '1 500 ₽',
    description: 'Саундхилинг в группе',
    features: ['Глубокая релаксация', 'Снятие стресса и тревожности', 'Гармонизация энергии'],
    isPopular: false,
  },
  {
    title: 'Индивидуальная',
    price: 'от 3 000 ₽',
    description: 'Персональная сессия',
    features: ['Чаши — 3 000 ₽', 'Гонг + чаши — 3 500 ₽', 'Индивидуальный подход', 'Глубокое исцеление'],
    isPopular: true,
  },
  {
    title: 'Парная',
    price: 'от 3 500 ₽',
    description: 'Сессия для двоих',
    features: ['Чаши — 3 500 ₽', 'Гонг + чаши — 4 000 ₽', '2 человека', 'Совместное погружение'],
    isPopular: false,
  },
];

// Tibetan Bowl Massage
const tibetanMassage: PriceOption[] = [
  {
    title: 'Индивидуальный',
    price: '3 500 ₽',
    description: 'Массаж тибетскими чашами',
    features: ['Глубокое расслабление', 'Снятие мышечных зажимов', 'Улучшение сна', 'Энергетический баланс'],
    isPopular: false,
  },
  {
    title: 'Для двоих',
    price: '6 000 ₽',
    description: 'Массаж для пары',
    features: ['Совместное расслабление', 'Гармонизация энергии', 'Улучшение кровообращения', 'Медитативное погружение'],
    isPopular: false,
    isDark: true,
  },
];

interface PricingCardProps {
  option: PriceOption;
  onSelect: (title: string, price: string) => void;
  delay: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ option, onSelect, delay }) => (
  <FadeIn delay={delay} direction="up" className="h-full">
    <div
      className={`
        h-full relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-500 group overflow-hidden
        ${option.isPopular ? 'border-2 border-brand-green shadow-2xl bg-white lg:-mt-4 lg:mb-4 lg:py-10 z-10 hover:shadow-brand-green/20' : ''}
        ${option.isDark ? 'bg-[#1a1a1a] text-white shadow-xl hover:shadow-2xl hover:shadow-black/20' : ''}
        ${!option.isPopular && !option.isDark ? 'bg-white border border-stone-100 hover:border-brand-green/30 hover:shadow-xl' : ''}
      `}
    >
      {option.isPopular && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] animate-shimmer pointer-events-none z-0 opacity-40" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-green text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1 z-20">
            <Star className="w-3 h-3 fill-current" /> Рекомендуем
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
            <div className="mt-0.5 min-w-[16px] transition-transform group-hover/item:scale-110 text-brand-green">
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
        onClick={() => onSelect(option.title, option.price)}
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
          <span>Записаться</span>
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
        </span>
        {option.isPopular && (
          <div className="absolute inset-0 -translate-x-[100%] group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent z-0" />
        )}
      </button>
    </div>
  </FadeIn>
);

interface PricingSectionProps {
  title: string;
  subtitle?: string;
  options: PriceOption[];
  onSelect: (title: string, price: string) => void;
  columns?: 2 | 3;
}

const PricingSectionInner: React.FC<PricingSectionProps> = ({
  title,
  subtitle,
  options,
  onSelect,
  columns = 3,
}) => {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="mb-20 last:mb-0">
      <FadeIn>
        <h3 className="text-2xl md:text-3xl font-serif text-brand-text/90 mb-2 text-center">
          {title}
        </h3>
        {subtitle && (
          <p className="text-stone-400 text-sm text-center mb-8">{subtitle}</p>
        )}
      </FadeIn>
      <div className={`grid grid-cols-1 ${gridCols} gap-6 items-stretch mt-8`}>
        {options.map((option, idx) => (
          <PricingCard key={idx} option={option} onSelect={onSelect} delay={idx * 150} />
        ))}
      </div>
    </div>
  );
};

interface PricingProps {
  onBook?: (plan: string, price: string) => void;
  useCustomEvent?: boolean;
  customEventName?: string;
  className?: string;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Pricing: React.FC<PricingProps> = ({
  onBook,
  useCustomEvent = false,
  customEventName = 'ksebe-open-chat',
  className = '',
  showToast,
}) => {
  const handleSelect = (title: string, price: string) => {
    if (onBook) {
      onBook(title, price);
      return;
    }

    if (useCustomEvent) {
      const event = new CustomEvent(customEventName, {
        detail: {
          message: `Здравствуйте! Я хочу записаться на "${title}" за ${price}. Как это сделать?`,
        },
      });
      window.dispatchEvent(event);
      showToast?.('Переходим в чат для оформления...', 'success');
      return;
    }

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
            Услуги и абонементы
          </h4>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Стоимость</h2>
        </FadeIn>
      </div>

      <PricingSectionInner
        title="Йога-абонементы"
        subtitle="Групповые занятия"
        options={yogaSubscriptions}
        onSelect={handleSelect}
        columns={3}
      />

      <PricingSectionInner
        title="Персональные тренировки"
        subtitle="Индивидуальный подход"
        options={personalTraining}
        onSelect={handleSelect}
        columns={2}
      />

      <PricingSectionInner
        title="Саундхилинг"
        subtitle="Звукотерапия тибетскими чашами и гонгом"
        options={soundHealing}
        onSelect={handleSelect}
        columns={3}
      />

      <PricingSectionInner
        title="Массаж тибетскими чашами"
        subtitle="Глубокое расслабление через вибрации и звук"
        options={tibetanMassage}
        onSelect={handleSelect}
        columns={2}
      />
    </section>
  );
};

export default Pricing;
