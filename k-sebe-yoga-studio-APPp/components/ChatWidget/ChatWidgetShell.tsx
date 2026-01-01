import { MessageCircle, Mic, Phone, Shield, Sparkles, Trash2, X } from 'lucide-react';
import React from 'react';

interface ChatWidgetShellProps {
  isOpen: boolean;
  isLiveMode: boolean;
  onClose: () => void;
  onToggleOpen: () => void;
  onClearHistory: () => void;
  onOpenSettings: () => void;
  onStartLive: () => void;
  children: React.ReactNode;
}

export const ChatWidgetShell: React.FC<ChatWidgetShellProps> = ({
  isOpen,
  isLiveMode,
  onClose,
  onToggleOpen,
  onClearHistory,
  onOpenSettings,
  onStartLive,
  children,
}) => {
  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        {isOpen && (
          <div className="mb-4 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right h-[500px] ring-1 ring-black/5">
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
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 opacity-80" />
                </button>
              </div>
            </div>

            {children}
          </div>
        )}

        <button
          onClick={onToggleOpen}
          className={`
                group flex items-center gap-3 pl-5 pr-2 py-2 rounded-full shadow-[0_8px_30px_rgba(87,167,115,0.25)] transition-all hover:scale-105 active:scale-95
                ${isOpen ? 'bg-stone-100 text-stone-500' : isLiveMode ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-green text-white'}
            `}
        >
          <span className={`${isOpen ? 'hidden' : 'hidden sm:block'} font-medium text-sm pr-2`}>
            {isLiveMode ? 'Микрофон активен' : 'Ассистент'}
          </span>
          <div className={`p-2 rounded-full ${isOpen ? 'bg-white' : 'bg-white/20'}`}>
            {isOpen ? (
              <X className="w-5 h-5 text-stone-500" />
            ) : isLiveMode ? (
              <Mic className="w-5 h-5 animate-bounce" />
            ) : (
              <MessageCircle className="w-5 h-5" />
            )}
          </div>
          {!isOpen && !isLiveMode && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-yellow" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
