import { Shield, X } from 'lucide-react';
import React from 'react';
import type { ConsentKey } from '../../utils/consent';

export const ConsentModal: React.FC<{
  consentKey: ConsentKey;
  meta: { title: string; description: string };
  onApprove: () => void;
  onDeny: () => void;
}> = ({ consentKey, meta, onApprove, onDeny }) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4 pointer-events-auto">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 border border-stone-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-brand-green/10">
            <Shield className="w-5 h-5 text-brand-green" />
          </div>
          <div>
            <h3 className="text-lg font-serif text-brand-text">{meta.title}</h3>
            <p className="text-xs text-stone-400">Перед использованием нужна ваша согласие</p>
          </div>
          <button
            onClick={onDeny}
            className="ml-auto p-2 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-4 h-4 text-stone-400" />
          </button>
        </div>
        <p className="text-sm text-stone-500 mb-6">{meta.description}</p>
        <div className="flex gap-3">
          <button
            onClick={onDeny}
            className="flex-1 px-4 py-2.5 rounded-full border border-stone-200 text-stone-500 hover:bg-stone-50 transition-colors text-sm"
          >
            Не сейчас
          </button>
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-2.5 rounded-full bg-brand-green text-white hover:bg-brand-green/90 transition-colors text-sm"
          >
            Разрешить
          </button>
        </div>
        <span className="sr-only">{consentKey}</span>
      </div>
    </div>
  );
};
