import { Paywall } from '@ksebe/shared';
import React, { useEffect, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { supabase } from '../services/supabase';
import type { Subscription, SubscriptionPlan, SubscriptionStatus } from '../types';

interface SubscriptionProfileProps {
  onRequestPlan?: (plan: SubscriptionPlan) => void;
}

const statusLabels: Record<SubscriptionStatus, string> = {
  active: 'Активна',
  pending: 'Ожидает оплаты',
  canceled: 'Отменена',
  past_due: 'Проблема оплаты',
  trialing: 'Пробный период',
};

export const SubscriptionProfile: React.FC<SubscriptionProfileProps> = ({ onRequestPlan }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const session = await supabase.auth.getSession();
      if (!isMounted) return;
      const hasSession = !!session.data.session;
      setIsAuthenticated(hasSession);
      if (!hasSession) {
        setSubscription(null);
        return;
      }
      setIsLoading(true);
      const data = await subscriptionService.getCurrentSubscription();
      if (isMounted) setSubscription(data);
      setIsLoading(false);
    };
    load();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      onRequestPlan?.(plan);
      return;
    }

    setActionLoading(true);
    setMessage(null);
    try {
      const result = await subscriptionService.createPayment(plan, window.location.href);
      setSubscription(result.subscription);
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      } else {
        setMessage(result.message || 'Провайдер оплаты временно недоступен.');
      }
    } catch (e) {
      console.error('Payment init error', e);
      setMessage('Не удалось создать оплату. Попробуйте позже.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <section id="profile" className="py-24 px-4 md:px-12 max-w-6xl mx-auto scroll-mt-20">
      <div className="text-center mb-12">
        <h4 className="text-brand-green tracking-[0.2em] text-xs font-bold uppercase mb-4">
          Профиль
        </h4>
        <h2 className="text-4xl md:text-6xl font-serif text-brand-text/90">Управление подпиской</h2>
        <p className="text-stone-400 text-sm mt-3 max-w-2xl mx-auto">
          Подключите AI-подписку, чтобы получать расширенные возможности анализа и персональные
          рекомендации.
        </p>
      </div>

      <div className="bg-white/90 border border-stone-100 rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        {isAuthenticated ? (
          <div className="mb-6 text-sm text-stone-500">
            {isLoading ? (
              <span>Загружаем статус подписки…</span>
            ) : subscription ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span>Тариф:</span>
                  <span className="font-medium text-brand-text">
                    {subscription.plan.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Статус:</span>
                  <span className="font-medium text-brand-text">
                    {statusLabels[subscription.status]}
                  </span>
                </div>
                {subscription.current_period_end && (
                  <div className="flex items-center justify-between">
                    <span>Оплачено до:</span>
                    <span className="font-medium text-brand-text">
                      {new Date(subscription.current_period_end).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <span>У вас пока нет активной подписки. Доступен тариф Free.</span>
            )}
          </div>
        ) : (
          <div className="mb-6 text-sm text-stone-500">
            Войдите в аккаунт, чтобы активировать подписку онлайн. Пока можно оставить заявку, и мы
            свяжемся с вами.
          </div>
        )}

        {message && <div className="mb-6 text-sm text-rose-500">{message}</div>}

        <Paywall
          currentPlan={subscription?.plan ?? 'free'}
          currentStatus={subscription?.status ?? 'active'}
          onSelectPlan={handleSelectPlan}
          isLoading={actionLoading}
        />
      </div>
    </section>
  );
};
