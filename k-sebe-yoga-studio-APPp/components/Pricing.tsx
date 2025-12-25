import { Check, Star, ArrowRight } from 'lucide-react';
import React from 'react';
import { useToast } from '../context/ToastContext';
import { FadeIn } from './FadeIn';

interface PriceOption {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isDark?: boolean;
}

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
    features: ['625 ₽ за занятие', '4 посещения', 'Экономия 300 ₽', 'Срок: 30 дней'],
    isPopular: false,
  },
  {
    title: '9 занятий',
    price: '5 000 ₽',
    description: 'Срок 1 месяц с первого посещения',
    features: ['556 ₽ за занятие', '9 посещений', 'Экономия 1 300 ₽', 'Срок: 30 дней'],
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
        h-full relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-300 hover:scale-[1.02] overflow-hidden
        ${option.isPopular ? 'border-2 border-brand-green shadow-xl bg-white scale-[1.02] z-10' : ''}
        ${option.isDark ? 'bg-[#1a1a1a] text-white shadow-xl' : 'bg-white border border-stone-100'}
      `}
    >
      {option.isPopular && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg] animate-shimmer pointer-events-none z-0 opacity-40"></div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-green text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg z-20 flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Рекомендуем
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
              className={`mt-0.5 min-w-[16px] text-brand-green`}
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
        onClick={() => onSelect(option.title, option.price)}
        className={`
          w-full py-4 rounded-xl font-medium transition-all duration-300 text-sm tracking-wide uppercase relative z-10 flex items-center justify-center gap-2
          ${
            option.isDark
              ? 'bg-brand-green text-white hover:bg-brand-green/90'
              : option.isPopular
                ? 'bg-brand-green text-white hover:bg-brand-green/90 shadow-lg shadow-brand-green/30'
                : 'bg-stone-50 text-brand-text hover:bg-stone-100'
          }
        `}
      >
        <span>Записаться</span>
        <ArrowRight className="w-4 h-4" />
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

const PricingSection: React.FC<PricingSectionProps> = ({
  title,
  subtitle,
  options,
  onSelect,
  columns = 3,
}) => {
  const gridCols = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <div className="mb-16 last:mb-0">
      <FadeIn>
        <h3 className="text-2xl md:text-3xl font-serif text-brand-text/90 mb-2 text-center">
          {title}
        </h3>
        {subtitle && (
          <p className="text-stone-400 text-sm text-center mb-6">{subtitle}</p>
        )}
      </FadeIn>
      <div className={`grid grid-cols-1 ${gridCols} gap-6 mt-6`}>
        {options.map((option, idx) => (
          <PricingCard key={idx} option={option} onSelect={onSelect} delay={idx * 150} />
        ))}
      </div>
    </div>
  );
};

export const Pricing: React.FC = () => {
  const { showToast } = useToast();

  const handleSelect = (title: string, price: string) => {
    const event = new CustomEvent('ksebe-open-chat', {
      detail: {
        message: `Здравствуйте! Я хочу записаться на "${title}" за ${price}. Как это сделать?`,
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
            Услуги и абонементы
          </h4>
          <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Стоимость</h2>
        </FadeIn>
      </div>

      <PricingSection
        title="Йога-абонементы"
        subtitle="Групповые занятия"
        options={yogaSubscriptions}
        onSelect={handleSelect}
        columns={3}
      />

      <PricingSection
        title="Персональные тренировки"
        subtitle="Индивидуальный подход"
        options={personalTraining}
        onSelect={handleSelect}
        columns={2}
      />

      <PricingSection
        title="Саундхилинг"
        subtitle="Звукотерапия тибетскими чашами и гонгом"
        options={soundHealing}
        onSelect={handleSelect}
        columns={3}
      />

      <PricingSection
        title="Массаж тибетскими чашами"
        subtitle="Глубокое расслабление через вибрации и звук"
        options={tibetanMassage}
        onSelect={handleSelect}
        columns={2}
      />
    </section>
  );
};
