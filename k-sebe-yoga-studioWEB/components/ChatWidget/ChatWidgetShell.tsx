import { ArrowLeft, Grid, MessageCircle, Phone, Sparkles, Trash2, X } from 'lucide-react';
import React from 'react';

interface ChatWidgetShellProps {
  isOpen: boolean;
  isMenuOpen: boolean;
  isLiveMode: boolean;
  headerLabel: string;
  onClose: () => void;
  onToggleOpen: () => void;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onClearMessages: () => void;
  onStartLive: () => void;
  children: React.ReactNode;
}

export const ChatWidgetShell: React.FC<ChatWidgetShellProps> = ({
  isOpen,
  isMenuOpen,
  isLiveMode,
  headerLabel,
  onClose,
  onToggleOpen,
  onOpenMenu,
  onCloseMenu,
  onClearMessages,
  onStartLive,
  children,
}) => {
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200 h-[80vh] sm:h-[650px]">
          <div className="bg-brand-green p-3 text-white shadow-md z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {isMenuOpen ? (
                  <button onClick={onCloseMenu} className="hover:bg-white/10 p-1 rounded-full">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <Sparkles className="w-5 h-5 text-brand-accent" />
                )}
                <span className="font-medium">{headerLabel}</span>
              </div>
              <div className="flex items-center gap-1">
                {!isLiveMode && !isMenuOpen && (
                  <button onClick={onOpenMenu} className="p-2 hover:bg-white/10 rounded-full">
                    <Grid className="w-4 h-4" />
                  </button>
                )}
                {!isLiveMode && !isMenuOpen && (
                  <button onClick={onClearMessages} className="p-2 hover:bg-white/10 rounded-full">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {!isLiveMode && !isMenuOpen && (
                  <button onClick={onStartLive} className="p-2 hover:bg-white/10 rounded-full">
                    <Phone className="w-4 h-4" />
                  </button>
                )}
                <button onClick={onClose} className="hover:text-brand-accent p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {children}
        </div>
      )}

      <button
        onClick={onToggleOpen}
        className="group flex items-center gap-2 bg-brand-green text-brand-accent hover:bg-brand-green/90 p-4 rounded-full shadow-2xl transition-all hover:scale-105"
      >
        <span className={`${isOpen ? 'hidden' : 'hidden sm:block'} font-medium pr-1`}>
          AI Тренер
        </span>
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
