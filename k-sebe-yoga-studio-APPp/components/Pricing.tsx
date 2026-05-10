import {
  DEFAULT_PRICING_DATA,
  emptyPricingData,
  isSupabaseConfigured,
  PRICING_CATEGORIES,
  supabase,
} from '@ksebe/shared';
import type { SharedPricingData, SharedPricingOption } from '@ksebe/shared';
import { ArrowRight, Check, CreditCard, Loader2, MessageCircle, Star } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { paymentService } from '../services/paymentService';
import { FadeIn } from './FadeIn';

type PricingPlanRow = {
  id: string;
  category: keyof SharedPricingData;
  title: string;
  price: string;
  description: string | null;
  features: string[] | null;
  is_popular: boolean | null;
  is_dark: boolean | null;
  amount_cents?: number | null;
  currency?: 'RUB' | null;
  visits_total?: number | null;
  valid_days?: number | null;
  is_payable?: boolean | null;
};

const toPricingOption = (plan: PricingPlanRow): SharedPricingOption => ({
  id: plan.id,
  category: plan.category,
  title: plan.title,
  price: plan.price,
  description: plan.description || '',
  features: plan.features || [],
  isPopular: Boolean(plan.is_popular),
  isDark: Boolean(plan.is_dark),
  amountCents: plan.amount_cents ?? null,
  currency: plan.currency ?? 'RUB',
  visitsTotal: plan.visits_total ?? null,
  validDays: plan.valid_days ?? null,
  isPayable: Boolean(
    plan.is_payable && plan.amount_cents && plan.visits_total && plan.valid_days
  ),
});

async function fetchPricingData(): Promise<SharedPricingData> {
  if (!isSupabaseConfigured || !supabase) return DEFAULT_PRICING_DATA;

  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) return DEFAULT_PRICING_DATA;

  const grouped = emptyPricingData();
  (data as PricingPlanRow[]).forEach((plan) => {
    if (grouped[plan.category]) grouped[plan.category].push(toPricingOption(plan));
  });

  return { ...DEFAULT_PRICING_DATA, ...grouped };
}

interface PricingCardProps {
  option: SharedPricingOption;
  onPay: (option: SharedPricingOption) => void;
  onContact: (option: SharedPricingOption) => void;
  isBusy: boolean;
  delay: number;
}

const PricingCard: React.FC<PricingCardProps> = ({ option, onPay, onContact, isBusy, delay }) => {
  const canPay = Boolean(option.id && option.isPayable);

  return (
    <FadeIn delay={delay} direction="up" className="h-full">
      <div
        className={`h-full relative flex flex-col p-7 rounded-[2rem] transition-all duration-300 overflow-hidden ${
          option.isPopular ? 'border-2 border-brand-green shadow-xl bg-white z-10' : ''
        } ${
          option.isDark
            ? 'bg-[#1a1a1a] text-white shadow-xl'
            : !option.isPopular
              ? 'bg-white border border-stone-100'
              : ''
        }`}
      >
        {option.isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-green text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Рекомендуем
          </div>
        )}

        <div className="mb-6">
          <h3
            className={`text-xl font-serif mb-2 ${option.isDark ? 'text-white' : 'text-brand-text'}`}
          >
            {option.title}
          </h3>
          <p className={`text-sm ${option.isDark ? 'text-white/50' : 'text-stone-400'}`}>
            {option.description}
          </p>
        </div>

        <div className="mb-7">
          <span className="text-4xl font-serif">{option.price}</span>
        </div>

        <ul className="space-y-3 mb-8 flex-1">
          {option.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3 text-sm">
              <Check className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
              <span className={option.isDark ? 'text-white/80' : 'text-brand-text/70'}>
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => (canPay ? onPay(option) : onContact(option))}
          className={`w-full py-4 rounded-xl font-medium transition-all duration-300 text-sm tracking-wide uppercase flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait ${
            option.isDark || option.isPopular
              ? 'bg-brand-green text-white hover:bg-brand-green/90 shadow-lg shadow-brand-green/20'
              : 'bg-stone-50 text-brand-text hover:bg-stone-100'
          }`}
        >
          {isBusy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : canPay ? (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Оплатить</span>
            </>
          ) : (
            <>
              <MessageCircle className="w-4 h-4" />
              <span>Записаться</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </FadeIn>
  );
};

export const Pricing: React.FC = () => {
  const { authStatus } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState(PRICING_CATEGORIES[0].id);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [plans, setPlans] = useState<SharedPricingData>(DEFAULT_PRICING_DATA);

  React.useEffect(() => {
    let mounted = true;
    fetchPricingData()
      .then((data) => {
        if (mounted) setPlans(data);
      })
      .catch(() => {
        if (mounted) setPlans(DEFAULT_PRICING_DATA);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const activeSection = useMemo(
    () => PRICING_CATEGORIES.find((category) => category.id === activeTab) ?? PRICING_CATEGORIES[0],
    [activeTab]
  );

  const handleContact = (option: SharedPricingOption) => {
    window.dispatchEvent(
      new CustomEvent('ksebe-open-chat', {
        detail: {
          message: `Здравствуйте! Хочу записаться на "${option.title}" за ${option.price}. Как это сделать?`,
        },
      })
    );
    showToast('Открываем чат для оформления...', 'success');
  };

  const handlePay = async (option: SharedPricingOption) => {
    if (!option.id) {
      handleContact(option);
      return;
    }
    if (authStatus !== 'authenticated') {
      showToast('Войдите в аккаунт приложения, чтобы оплатить онлайн.', 'error');
      return;
    }

    setBusyPlanId(option.id);
    try {
      const result = await paymentService.createCheckout(option.id, window.location.href);
      window.location.href = result.confirmationUrl;
    } catch (e) {
      console.error('Payment checkout error', e);
      showToast('Не удалось открыть оплату. Попробуйте позже или напишите в чат.', 'error');
    } finally {
      setBusyPlanId(null);
    }
  };

  const sectionPlans = plans[activeSection.id] || [];
  const gridCols = activeSection.columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 lg:grid-cols-3';

  return (
    <section id="pricing" className="py-8 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div className="text-center mb-10">
        <FadeIn>
          <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
            Услуги и абонементы
          </h4>
          <h2 className="text-4xl md:text-5xl font-serif text-brand-text/90">Стоимость</h2>
        </FadeIn>
      </div>

      <FadeIn delay={100}>
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {PRICING_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setActiveTab(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                activeTab === category.id
                  ? 'bg-brand-green text-white border-brand-green shadow-sm'
                  : 'bg-white text-brand-text border-stone-200 hover:border-brand-green/40 hover:text-brand-green'
              }`}
              aria-pressed={activeTab === category.id}
            >
              {category.label}
            </button>
          ))}
        </div>
      </FadeIn>

      <div className="mb-16">
        <FadeIn>
          <h3 className="text-2xl md:text-3xl font-serif text-brand-text/90 mb-2 text-center">
            {activeSection.title}
          </h3>
          <p className="text-stone-400 text-sm text-center mb-6">{activeSection.subtitle}</p>
        </FadeIn>

        <div className={`grid grid-cols-1 ${gridCols} gap-5 mt-6`}>
          {sectionPlans.map((option, index) => (
            <PricingCard
              key={option.id ?? `${option.category}-${option.title}`}
              option={option}
              onPay={handlePay}
              onContact={handleContact}
              isBusy={busyPlanId === option.id}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
