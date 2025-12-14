/**
 * K Sebe Yoga Studio - CookieBanner Component
 * ============================================
 * GDPR-compliant cookie consent banner
 */

import { X } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface CookieBannerProps {
  /** localStorage key (default: cookie-consent) */
  storageKey?: string;
  /** Delay before showing in ms (default: 2000) */
  delay?: number;
  /** Callback when user accepts */
  onAccept?: () => void;
  /** Callback when user closes */
  onClose?: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({
  storageKey = 'cookie-consent',
  delay = 2000,
  onAccept,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consented = localStorage.getItem(storageKey);
      if (!consented) {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, [storageKey, delay]);

  const handleAccept = () => {
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      // localStorage unavailable
    }
    setIsVisible(false);
    onAccept?.();
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 bg-white p-6 rounded-2xl shadow-2xl border border-stone-100 z-[90] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-serif text-lg text-brand-text">Мы используем cookie</h4>
        <button
          onClick={handleClose}
          className="text-stone-400 hover:text-stone-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <p className="text-xs text-stone-500 mb-4 leading-relaxed">
        Мы используем файлы cookie для улучшения работы сайта и анализа трафика. Продолжая
        использовать сайт, вы соглашаетесь с этим.
      </p>
      <div className="flex gap-3">
        <button
          onClick={handleAccept}
          className="flex-1 bg-brand-green text-white text-xs font-bold uppercase tracking-wider py-3 rounded-lg hover:bg-brand-green/90 transition-colors"
        >
          Принять
        </button>
        <button
          onClick={handleClose}
          className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-stone-600 transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
