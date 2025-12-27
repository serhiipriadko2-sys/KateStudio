import { X } from 'lucide-react';
import React from 'react';
import type { ConsentKey, ConsentState } from '../../utils/consent';

export const ConsentSettingsModal: React.FC<{
  consents: ConsentState;
  consentMeta: Record<ConsentKey, { title: string; description: string }>;
  onClose: () => void;
  onReset: () => void;
  onRequest: (key: ConsentKey) => void;
  onDeny: (key: ConsentKey) => void;
}> = ({ consents, consentMeta, onClose, onReset, onRequest, onDeny }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-stone-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-serif text-brand-text">Согласия и приватность</h3>
            <p className="text-xs text-stone-400">Управляйте доступами ассистента</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Закрыть настройки"
          >
            <X className="w-4 h-4 text-stone-400" />
          </button>
        </div>

        <div className="space-y-4">
          {(Object.keys(consentMeta) as ConsentKey[]).map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 bg-stone-50 rounded-2xl px-4 py-3 border border-stone-100"
            >
              <div>
                <p className="text-sm font-medium text-brand-text">{consentMeta[key].title}</p>
                <p className="text-xs text-stone-400">{consentMeta[key].description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`text-[10px] uppercase font-semibold tracking-wide ${consents[key] === 'granted' ? 'text-emerald-600' : consents[key] === 'denied' ? 'text-rose-500' : 'text-stone-400'}`}
                >
                  {consents[key] === 'granted'
                    ? 'Разрешено'
                    : consents[key] === 'denied'
                      ? 'Запрещено'
                      : 'Не выбрано'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onRequest(key)}
                    className="px-3 py-1.5 rounded-full text-xs bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white transition-colors"
                  >
                    Разрешить
                  </button>
                  <button
                    onClick={() => onDeny(key)}
                    className="px-3 py-1.5 rounded-full text-xs bg-stone-200 text-stone-600 hover:bg-stone-300 transition-colors"
                  >
                    Запретить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors text-sm"
          >
            Сбросить
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-full bg-brand-green text-white hover:bg-brand-green/90 transition-colors text-sm"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
