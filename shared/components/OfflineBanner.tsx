/**
 * K Sebe Yoga Studio - Offline Banner
 * Shows notification when the app is offline
 */

import { WifiOff } from 'lucide-react';
import React from 'react';

export interface OfflineBannerProps {
  /** Whether the banner is visible */
  visible: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[60] animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-brand-dark/95 backdrop-blur rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 flex gap-3 items-start">
          <div className="shrink-0 mt-0.5">
            <div className="p-2 rounded-full bg-white/10">
              <WifiOff className="w-4 h-4 text-brand-mint" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm">Оффлайн-режим</p>
            <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
              Нет соединения. Страница доступна из кеша.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
