import { Check, Loader2, X } from 'lucide-react';
import React from 'react';

interface PaywallProps {
  onClose: () => void;
  onSubscribe?: (plan: string) => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onClose, onSubscribe }) => {
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);

  const handleSubscribe = (plan: string) => {
    if (onSubscribe) {
      setLoadingPlan(plan);
      onSubscribe(plan);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, plan: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSubscribe(plan);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 transition-colors z-10"
        >
          <X className="w-5 h-5 text-stone-500" />
        </button>

        <div className="p-8 pb-6 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-brand-green/10 text-brand-green text-xs font-bold uppercase tracking-widest mb-6">
            Premium Access
          </div>
          <h2 className="text-3xl font-serif text-brand-text mb-3">Открой полный потенциал</h2>
          <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">
            Получи доступ к эксклюзивным практикам, AI-анализу и персональным рекомендациям.
          </p>
        </div>

        <div className="px-6 space-y-4 mb-8">
          <div
            onClick={() => handleSubscribe('premium')}
            onKeyDown={(e) => handleKeyDown(e, 'premium')}
            role="button"
            tabIndex={0}
            className="group relative p-6 rounded-[2rem] border-2 border-brand-green bg-brand-mint/10 cursor-pointer transition-all hover:scale-[1.02] outline-none focus:ring-2 focus:ring-brand-green"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-serif font-bold text-brand-text">Premium</span>
              <span className="text-lg font-bold text-brand-green">
                990 ₽ <span className="text-xs font-normal text-stone-500">/ мес</span>
              </span>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <Check className="w-4 h-4 text-brand-green" /> Безлимитный AI чат
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <Check className="w-4 h-4 text-brand-green" /> Анализ асан по фото
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <Check className="w-4 h-4 text-brand-green" /> Доступ ко всем видео
              </li>
            </ul>
            <button
              disabled={!!loadingPlan}
              className="w-full py-3 bg-brand-green text-white rounded-xl font-bold uppercase tracking-wide shadow-lg shadow-brand-green/20 group-hover:bg-brand-green/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loadingPlan === 'premium' && <Loader2 className="w-4 h-4 animate-spin" />}
              Попробовать бесплатно
            </button>
            <p className="text-[10px] text-center text-stone-400 mt-2">
              7 дней бесплатно, затем 990 ₽/мес
            </p>
          </div>

          <div
            onClick={() => handleSubscribe('vip')}
            onKeyDown={(e) => handleKeyDown(e, 'vip')}
            role="button"
            tabIndex={0}
            className="group p-6 rounded-[2rem] border border-stone-100 bg-white hover:border-brand-yellow/50 cursor-pointer transition-all hover:scale-[1.02] outline-none focus:ring-2 focus:ring-brand-yellow"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-serif font-bold text-brand-text">VIP</span>
              <span className="text-lg font-bold text-brand-text">
                2,990 ₽ <span className="text-xs font-normal text-stone-500">/ мес</span>
              </span>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <Check className="w-4 h-4 text-brand-yellow" /> Всё из Premium
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <Check className="w-4 h-4 text-brand-yellow" /> Личные консультации
              </li>
            </ul>
            <button
              disabled={!!loadingPlan}
              className="w-full py-3 bg-stone-100 text-stone-600 rounded-xl font-bold uppercase tracking-wide hover:bg-stone-200 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loadingPlan === 'vip' && <Loader2 className="w-4 h-4 animate-spin" />}
              Выбрать VIP
            </button>
          </div>
        </div>

        <div className="p-6 bg-stone-50 text-center">
          <button
            onClick={onClose}
            className="text-xs text-stone-400 hover:text-stone-600 underline"
          >
            Восстановить покупки
          </button>
        </div>
      </div>
    </div>
  );
};
