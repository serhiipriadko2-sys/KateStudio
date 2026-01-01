import { Send } from 'lucide-react';
import React from 'react';

export const ChatInput: React.FC<{
  inputRef: React.RefObject<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
}> = ({ inputRef, value, onChange, onSend, onKeyDown, isLoading }) => {
  return (
    <div className="p-3 bg-white border-t border-stone-100 flex gap-2 items-center">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Задайте вопрос..."
        className="flex-1 px-4 py-2.5 bg-stone-50 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-green text-sm border border-stone-100 transition-all placeholder:text-stone-400"
      />
      <button
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        className="p-2.5 bg-brand-green text-white rounded-xl hover:bg-brand-green/90 disabled:opacity-50 disabled:hover:bg-brand-green transition-all shadow-md active:scale-95"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
};
