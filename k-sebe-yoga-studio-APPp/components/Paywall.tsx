import { Check, Loader2, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface PaywallProps {
  onClose?: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'premium' | 'vip') => {
    if (!user) {
      showToast('Пожалуйста, войдите в систему', 'error');
      return;
    }

    setLoading(plan);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          plan,
          returnUrl: window.location.origin, // Return to app after payment
        },
      });

      if (error) throw error;

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('Не удалось получить ссылку на оплату');
      }
    } catch (err) {
      console.error('Payment error:', err);
      showToast('Ошибка при создании платежа', 'error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1a1a1a] w-full max-w-lg rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          ✕
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green/20 rounded-full mb-6">
            <Sparkles className="w-8 h-8 text-brand-green" />
          </div>
          <h2 className="text-3xl font-serif text-white mb-2">K Sebe Premium</h2>
          <p className="text-white/60 mb-8">Откройте полный доступ к практикам и AI-коучу</p>

          <div className="space-y-4">
            {/* Premium Plan */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-brand-green/50 transition-colors cursor-pointer"
                 onClick={() => handleSubscribe('premium')}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Premium</h3>
                <span className="text-brand-green font-bold text-xl">499 ₽ <span className="text-sm text-white/40 font-normal">/ мес</span></span>
              </div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2 text-white/70 text-sm">
                  <Check className="w-4 h-4 text-brand-green" /> Безлимитный AI-коуч
                </li>
                <li className="flex items-center gap-2 text-white/70 text-sm">
                  <Check className="w-4 h-4 text-brand-green" /> Полная библиотека видео
                </li>
                <li className="flex items-center gap-2 text-white/70 text-sm">
                  <Check className="w-4 h-4 text-brand-green" /> Персональные программы
                </li>
              </ul>
              <button
                disabled={loading === 'premium'}
                className="w-full py-3 bg-brand-green text-white rounded-xl font-bold uppercase tracking-wider hover:bg-brand-green/90 transition-all flex justify-center items-center gap-2"
              >
                {loading === 'premium' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Оформить подписку'}
              </button>
            </div>

            {/* VIP Plan */}
            <div className="bg-gradient-to-br from-brand-gold/20 to-transparent rounded-2xl p-6 border border-brand-gold/30 hover:border-brand-gold/60 transition-colors cursor-pointer relative overflow-hidden"
                 onClick={() => handleSubscribe('vip')}>
               <div className="absolute top-0 right-0 bg-brand-gold text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">
                 Best Value
               </div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-brand-gold">VIP</h3>
                <span className="text-brand-gold font-bold text-xl">1 999 ₽ <span className="text-sm text-white/40 font-normal">/ мес</span></span>
              </div>
              <ul className="text-left space-y-2 mb-6">
                <li className="flex items-center gap-2 text-white/70 text-sm">
                  <Check className="w-4 h-4 text-brand-gold" /> Всё, что в Premium
                </li>
                <li className="flex items-center gap-2 text-white/70 text-sm">
                  <Check className="w-4 h-4 text-brand-gold" /> Личный разбор техники (видео)
                </li>
                <li className="flex items-center gap-2 text-white/70 text-sm">
                  <Check className="w-4 h-4 text-brand-gold" /> Приоритетная поддержка 24/7
                </li>
              </ul>
              <button
                disabled={loading === 'vip'}
                className="w-full py-3 bg-brand-gold text-black rounded-xl font-bold uppercase tracking-wider hover:bg-brand-gold/90 transition-all flex justify-center items-center gap-2"
              >
                {loading === 'vip' ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Стать VIP'}
              </button>
            </div>
          </div>

          <p className="text-xs text-white/30 mt-6">
            Отменяйте в любое время. Безопасная оплата через YooKassa.
          </p>
        </div>
      </div>
    </div>
  );
};
