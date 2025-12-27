import { AlertCircle, Mic, StopCircle } from 'lucide-react';
import React from 'react';

export const LiveModePanel: React.FC<{
  isLiveConnected: boolean;
  liveError: string | null;
  onStop: () => void;
}> = ({ isLiveConnected, liveError, onStop }) => {
  return (
    <div className="flex-1 bg-gradient-to-b from-stone-50 to-white flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
      {/* Pulse Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-40 h-40 bg-brand-green/10 rounded-full blur-xl transition-all duration-1000 ${isLiveConnected ? 'scale-150 opacity-100' : 'scale-100 opacity-20'}`}
        />
        {isLiveConnected && (
          <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-brand-mint/20 via-transparent to-transparent animate-pulse" />
        )}
      </div>

      <div className="relative z-10 bg-white p-6 rounded-full shadow-lg shadow-brand-green/10 mb-8 transition-transform duration-300 border border-stone-50">
        <Mic
          className={`w-10 h-10 transition-colors duration-500 ${isLiveConnected ? 'text-brand-green animate-pulse' : 'text-stone-300'}`}
        />
      </div>

      <h3 className="text-xl font-serif text-brand-text mb-2">
        {liveError ? 'Ошибка доступа' : isLiveConnected ? 'Слушаю вас...' : 'Соединение...'}
      </h3>
      <p className="text-stone-400 text-xs mb-12 flex items-center gap-2 justify-center h-5">
        {liveError ? <AlertCircle className="w-3 h-3 text-rose-500" /> : null}
        {liveError || 'Говорите свободно, я понимаю по-русски'}
      </p>

      <button
        onClick={onStop}
        className="bg-rose-500/10 text-rose-600 px-6 py-3 rounded-full hover:bg-rose-500 hover:text-white transition-all font-medium text-sm flex items-center gap-2 relative z-20 border border-rose-200 hover:border-transparent"
      >
        <StopCircle className="w-4 h-4" />
        Завершить
      </button>
    </div>
  );
};
