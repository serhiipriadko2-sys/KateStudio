import { Brain, Loader2, Pause, Play } from 'lucide-react';
import React from 'react';
import type { ChatMessage } from '../../types';

export const ChatMessages: React.FC<{
  messages: ChatMessage[];
  isLoading: boolean;
  loadingText: string;
  playingMessageId: number | null;
  onToggleAudio: (index: number) => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}> = ({ messages, isLoading, loadingText, playingMessageId, onToggleAudio, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50 scroll-smooth">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`flex flex-col gap-2 max-w-[90%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.generatedVideoUrl && (
              <div className="w-full max-w-[240px] rounded-2xl overflow-hidden shadow-lg border border-brand-green/20 mb-1">
                <video
                  src={msg.generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full bg-black"
                />
                <div className="bg-black/50 text-white text-[10px] px-2 py-1 absolute top-2 right-2 rounded">
                  Veo AI
                </div>
              </div>
            )}
            {msg.generatedImageUrl && (
              <div className="w-full max-w-[240px] rounded-2xl overflow-hidden shadow-lg border border-brand-green/20 mb-1">
                <img src={msg.generatedImageUrl} alt="AI Art" className="w-full" />
              </div>
            )}

            <div
              className={`rounded-2xl p-3 text-sm shadow-sm relative overflow-hidden ${msg.role === 'user' ? 'bg-brand-green text-white rounded-br-none' : 'bg-white text-stone-800 border border-stone-100 rounded-bl-none'}`}
            >
              {msg.isThinking && (
                <div className="text-[10px] text-brand-green/70 font-bold uppercase mb-1 flex items-center gap-1">
                  <Brain className="w-3 h-3" /> Thinking Mode
                </div>
              )}
              {msg.diarySummary && (
                <div className="bg-brand-mint/20 p-2 rounded mb-2 text-xs border-l-2 border-brand-green">
                  <strong>Инсайты:</strong> {msg.diarySummary}
                </div>
              )}
              <div className="whitespace-pre-line leading-relaxed">{msg.text}</div>
            </div>

            {msg.audioBase64 && (
              <button
                onClick={() => onToggleAudio(idx)}
                className="p-2 bg-white rounded-full shadow-sm border border-stone-100 hover:text-brand-green"
              >
                {playingMessageId === idx ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="flex items-center gap-2 text-xs text-stone-400 p-2">
          <Loader2 className="w-3 h-3 animate-spin" /> {loadingText || 'Печатает...'}
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
