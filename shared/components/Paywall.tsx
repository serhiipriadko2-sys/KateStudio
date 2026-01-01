/**
 * Paywall Component - AI Subscription Plans
 * Shared across WEB and APP
 */
import { Check, Crown, Sparkles, Star } from 'lucide-react';
import React from 'react';
import { FadeIn } from './FadeIn';

export type PaywallPlanId = 'free' | 'premium' | 'vip';
export type PaywallStatus = 'active' | 'pending' | 'canceled' | 'past_due' | 'trialing';

interface PaywallPlan {
  id: PaywallPlanId;
  title: string;
  price: string;
  description: string;
  highlight?: boolean;
  features: string[];
  badge?: string;
}

const paywallPlans: PaywallPlan[] = [
  {
    id: 'free',
    title: 'Free',
    price: '0 ₽',
    description: 'Для знакомства с AI-практиками',
    features: [
      'Базовый чат и дыхательные подсказки',
      'Ограниченные лимиты AI',
      'Поддержка стандартных практик',
    ],
  },
  {
    id: 'premium',
    title: 'Premium',
    price: '990 ₽/мес',
    description: 'Больше внимания от AI-тренера',
    highlight: true,
    badge: 'Рекомендуем',
    features: [
      'Расширенные лимиты AI',
      'Генерация медитаций и программ',
      'Анализ поз и фото',
      'Поддержка по приоритету',
    ],
  },
  {
    id: 'vip',
    title: 'VIP',
    price: '1 990 ₽/мес',
    description: 'Максимальные лимиты и персонализация',
    badge: 'Максимум',
    features: [
      'Самые высокие лимиты AI',
      'Анализ видео практики',
      'Персональные рекомендации',
      'Приоритетный доступ к новым функциям',
    ],
  },
];

const statusLabels: Record<PaywallStatus, string> = {
  active: 'Активна',
  pending: 'Ожидает оплаты',
  canceled: 'Отменена',
  past_due: 'Проблема оплаты',
  trialing: 'Пробный период',
};

interface PaywallProps {
  currentPlan?: PaywallPlanId;
  currentStatus?: PaywallStatus;
  onSelectPlan?: (planId: PaywallPlanId) => void;
  isLoading?: boolean;
  className?: string;
}

const PaywallCard: React.FC<{
  plan: PaywallPlan;
  isCurrent: boolean;
  currentStatus?: PaywallStatus;
  onSelectPlan?: (planId: PaywallPlanId) => void;
  isLoading?: boolean;
  delay: number;
}> = ({ plan, isCurrent, currentStatus, onSelectPlan, isLoading, delay }) => {
  const isActionable = !!onSelectPlan && (!isCurrent || currentStatus !== 'active');
  const buttonLabel = isCurrent
    ? currentStatus && currentStatus !== 'active'
      ? 'Обновить оплату'
      : 'Текущий тариф'
    : 'Выбрать';

  const buttonDisabled = !isActionable || isLoading;

  return (
    <FadeIn delay={delay} direction="up" className="h-full">
      <div
        className={`relative flex flex-col h-full p-7 rounded-[2rem] border transition-all duration-500 overflow-hidden group
          ${
            plan.highlight
              ? 'bg-white border-brand-green shadow-2xl shadow-brand-green/10 lg:-mt-3'
              : 'bg-white border-stone-100 hover:border-brand-green/30 hover:shadow-xl'
          }
        `}
      >
        {plan.badge && (
          <div className="absolute top-4 right-4 bg-brand-green text-white text-[10px] uppercase tracking-[0.2em] px-3 py-1 rounded-full flex items-center gap-1 shadow">
            {plan.highlight ? <Star className="w-3 h-3" /> : <Crown className="w-3 h-3" />}
            {plan.badge}
          </div>
        )}

        <div className="mb-5">
          <div className="flex items-center gap-2 text-brand-green mb-2">
            {plan.id === 'free' ? <Sparkles className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
            <span className="text-xs uppercase tracking-[0.2em] font-semibold">{plan.title}</span>
          </div>
          <h3 className="text-2xl font-serif text-brand-text">{plan.price}</h3>
          <p className="text-sm text-stone-400 mt-2">{plan.description}</p>
        </div>

        <ul className="space-y-3 text-sm text-brand-text/70 flex-1">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-brand-green mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onSelectPlan?.(plan.id)}
          disabled={buttonDisabled}
          className={`mt-6 w-full py-3 rounded-xl text-sm font-medium uppercase tracking-wide transition-all
            ${
              buttonDisabled
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : plan.highlight
                  ? 'bg-brand-green text-white hover:bg-brand-green/90 shadow-lg shadow-brand-green/20'
                  : 'bg-stone-50 text-brand-text hover:bg-stone-100 hover:text-brand-green'
            }
          `}
        >
          {isLoading && isCurrent ? 'Обновляем…' : buttonLabel}
        </button>
      </div>
    </FadeIn>
  );
};

export const Paywall: React.FC<PaywallProps> = ({
  currentPlan,
  currentStatus,
  onSelectPlan,
  isLoading,
  className,
}) => {
  return (
    <section className={className}>
      <FadeIn>
        <div className="flex flex-col items-center text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-serif text-brand-text mb-2">
            Подписка на AI-помощника
          </h2>
          <p className="text-sm text-stone-400 max-w-xl">
            Выберите тариф, который подходит вашему ритму. Лимиты AI зависят от плана.
          </p>
          {currentPlan && currentStatus && (
            <div className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] bg-brand-mint/40 text-brand-green px-4 py-1.5 rounded-full">
              Текущий тариф: {currentPlan.toUpperCase()} • {statusLabels[currentStatus]}
            </div>
          )}
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {paywallPlans.map((plan, index) => (
          <PaywallCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.id === currentPlan}
            currentStatus={currentStatus}
            onSelectPlan={onSelectPlan}
            isLoading={isLoading}
            delay={index * 120}
          />
        ))}
      </div>
    </section>
  );
};

export default Paywall;
