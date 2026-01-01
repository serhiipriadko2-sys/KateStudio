import { ExternalLink, Loader2, Sparkles, Volume2 } from 'lucide-react';
import React from 'react';
import type { ChatMessage } from '../../types';

function messageKey(msg: ChatMessage): string {
  return [
    msg.role,
    msg.text,
    msg.audioBase64 ?? '',
    msg.diarySummary ?? '',
    msg.sources?.map((s) => `${s.uri}:${s.title}`).join('|') ?? '',
  ].join('::');
}

export const ChatMessages: React.FC<{
  messages: ChatMessage[];
  isLoading: boolean;
  onPlayTts: (index: number, text: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}> = ({ messages, isLoading, onPlayTts, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9F9F9] scrollbar-thin scrollbar-thumb-stone-200">
      {messages.map((msg, idx) => (
        <div
          key={messageKey(msg)}
          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}
        >
          <div
            className={`flex items-end gap-2 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {msg.role === 'model' && (
              <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 text-brand-green" />
              </div>
            )}
            <div
              className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm border ${
                msg.role === 'user'
                  ? 'bg-brand-green text-white rounded-br-none border-transparent'
                  : 'bg-white text-stone-700 rounded-bl-none border-stone-100'
              }`}
            >
              {msg.text}
            </div>

            {msg.role === 'model' && (
              <button
                onClick={() => onPlayTts(idx, msg.text)}
                disabled={msg.isAudioLoading}
                className="p-1.5 bg-white rounded-full text-stone-400 hover:text-brand-green shadow-sm hover:scale-110 transition-all border border-stone-100 flex-shrink-0"
              >
                {msg.isAudioLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
              </button>
            )}
          </div>

          {msg.sources && msg.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 ml-9 max-w-[85%]">
              {msg.sources.map((src) => (
                <a
                  key={src.uri}
                  href={src.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[9px] bg-white border border-stone-200 px-2 py-1 rounded-full text-stone-500 hover:text-brand-green hover:border-brand-green/30 transition-colors"
                >
                  <ExternalLink className="w-2 h-2" />
                  <span className="truncate max-w-[100px]">{src.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start ml-8">
          <div className="bg-white rounded-2xl px-4 py-3 border border-stone-100 rounded-bl-none shadow-sm flex gap-1.5 items-center">
            <span className="text-xs text-stone-400 mr-1">Печатает</span>
            <div
              className="w-1 h-1 bg-stone-300 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-1 h-1 bg-stone-300 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-1 h-1 bg-stone-300 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
