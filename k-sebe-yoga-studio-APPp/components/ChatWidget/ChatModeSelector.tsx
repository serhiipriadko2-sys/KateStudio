import { Phone, Shield, Sparkles, Trash2, X } from 'lucide-react';
import React from 'react';

export const ChatModeSelector: React.FC<{
  isLiveMode: boolean;
  onClearHistory: () => void;
  onOpenSettings: () => void;
  onStartLive: () => void;
  onClose: () => void;
}> = ({ isLiveMode, onClearHistory, onOpenSettings, onStartLive, onClose }) => {
  return (
    <div className="bg-brand-green/95 backdrop-blur-md p-4 flex items-center justify-between text-white shadow-sm z-10">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-white/20 rounded-full">
          <Sparkles className="w-4 h-4 text-brand-yellow" />
        </div>
        <span className="font-medium text-sm">Ассистент К себе</span>
      </div>
      <div className="flex items-center gap-1">
        {!isLiveMode && (
          <>
            <button
              onClick={onClearHistory}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Очистить историю"
            >
              <Trash2 className="w-4 h-4 opacity-80" />
            </button>
            <button
              onClick={onOpenSettings}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Настройки согласий"
            >
              <Shield className="w-4 h-4 opacity-80" />
            </button>
            <button
              onClick={onStartLive}
              className="p-2 hover:bg-white/10 rounded-full transition-colors group relative"
              title="Голосовой режим"
            >
              <Phone className="w-4 h-4 opacity-80" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-brand-yellow rounded-full animate-pulse border border-brand-green" />
            </button>
          </>
        )}
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5 opacity-80" />
        </button>
      </div>
    </div>
  );
};
