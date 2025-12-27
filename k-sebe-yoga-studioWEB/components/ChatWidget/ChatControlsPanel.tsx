import { FileVideo, Mic, Send, StopCircle } from 'lucide-react';
import React from 'react';
import type { ChatMode } from '../../types';

export const ChatControlsPanel: React.FC<{
  mode: ChatMode;
  inputValue: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}> = ({
  mode,
  inputValue,
  onInputChange,
  onSend,
  isLoading,
  fileInputRef,
  onFileUpload,
  isRecording,
  onToggleRecording,
}) => {
  return (
    <div className="p-3 bg-white border-t border-stone-100">
      {mode === 'coach' && (
        <div className="mb-2">
          <input
            type="file"
            accept="video/*"
            ref={fileInputRef}
            onChange={onFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-stone-100 text-stone-600 rounded-xl text-xs font-medium hover:bg-stone-200 flex items-center justify-center gap-2"
          >
            <FileVideo className="w-4 h-4" /> Загрузить видео для анализа
          </button>
        </div>
      )}

      {mode === 'diary' && (
        <div className="flex justify-center mb-2">
          <button
            onClick={onToggleRecording}
            className={`p-4 rounded-full transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-stone-100 text-stone-600 hover:bg-brand-green hover:text-white'}`}
          >
            {isRecording ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder={
            mode === 'art'
              ? 'Опишите образ...'
              : mode === 'meditation'
                ? 'Тема медитации...'
                : 'Сообщение...'
          }
          className="flex-1 px-4 py-2 bg-stone-50 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-green text-sm border border-stone-100"
        />
        <button
          onClick={onSend}
          disabled={isLoading}
          className="p-2.5 bg-brand-green text-white rounded-full hover:bg-brand-green/90 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
