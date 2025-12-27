import { Mic, MicOff, StopCircle } from 'lucide-react';
import React from 'react';
import { AudioVisualizer } from './AudioVisualizer';

export const LiveModePanel: React.FC<{
  permissionError: boolean;
  isLiveConnected: boolean;
  isLiveSpeaking: boolean;
  onStop: () => void;
  onBack: () => void;
}> = ({ permissionError, isLiveConnected, isLiveSpeaking, onStop, onBack }) => {
  return (
    <div className="flex-1 bg-gradient-to-br from-brand-mint/50 to-white flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
      {permissionError ? (
        <div className="z-20 flex flex-col items-center">
          <MicOff className="w-8 h-8 text-rose-500 mb-4" />
          <h3>Нет доступа к микрофону</h3>
          <button onClick={onBack} className="mt-4 bg-stone-200 px-4 py-2 rounded-full text-sm">
            Вернуться
          </button>
        </div>
      ) : (
        <>
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div
              className={`w-64 h-64 bg-brand-green rounded-full blur-[80px] transition-opacity duration-1000 ${isLiveConnected ? 'opacity-40' : 'opacity-0'}`}
            />
          </div>
          <div className="relative z-10 bg-white p-8 rounded-full shadow-xl mb-6 flex items-center justify-center w-32 h-32">
            {isLiveSpeaking ? (
              <AudioVisualizer isActive={true} />
            ) : (
              <Mic
                className={`w-10 h-10 ${isLiveConnected ? 'text-brand-green' : 'text-stone-300'}`}
              />
            )}
          </div>
          <button
            onClick={onStop}
            className="bg-rose-500 text-white px-8 py-3 rounded-full hover:bg-rose-600 transition-colors shadow-lg flex items-center gap-2"
          >
            <StopCircle className="w-4 h-4" /> Завершить
          </button>
        </>
      )}
    </div>
  );
};
