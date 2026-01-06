/**
 * K Sebe Yoga Studio - PWA Update Banner
 * Shows notification when a new version is available
 *
 * Only displayed when registration.waiting exists (real update available)
 */

import { RefreshCcw, X } from 'lucide-react';
import React from 'react';

export interface UpdateBannerProps {
  /** Whether the banner is visible */
  visible: boolean;
  /** Whether an update action is in progress */
  updating?: boolean;
  /** Handler for update button click */
  onUpdate: () => void;
  /** Handler for dismiss button click */
  onDismiss: () => void;
}

export const UpdateBanner: React.FC<UpdateBannerProps> = ({
  visible,
  updating = false,
  onUpdate,
  onDismiss,
}) => {
  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[60] animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-brand-mint/40 overflow-hidden">
        <div className="p-4">
          <div className="flex gap-3 items-start">
            <div className="shrink-0 mt-0.5">
              <div
                className={`p-2 rounded-full bg-brand-mint/30 ${updating ? 'animate-spin' : ''}`}
              >
                <RefreshCcw className="w-4 h-4 text-brand-green" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-brand-dark text-sm">Доступно обновление</p>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                Обновите приложение для лучшей работы
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="shrink-0 p-1.5 rounded-full hover:bg-stone-100 transition-colors -mt-1 -mr-1"
              aria-label="Закрыть уведомление"
            >
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={onUpdate}
              disabled={updating}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-xl bg-brand-green text-white hover:bg-brand-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {updating ? 'Обновление...' : 'Обновить'}
            </button>
            <button
              onClick={onDismiss}
              disabled={updating}
              className="px-4 py-2.5 text-sm font-medium rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors disabled:opacity-50 min-h-[44px]"
            >
              Позже
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
