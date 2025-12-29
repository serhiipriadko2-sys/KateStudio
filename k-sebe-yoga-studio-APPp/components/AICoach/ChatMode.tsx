/**
 * ChatMode - AI Chat interface with streaming support
 */
import { Send, Sparkles, Brain } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { getGeminiChatStream, getThinkingResponse } from '../../services/geminiService';
import { FormattedText } from './FormattedText';
import { ChatMessage, SUGGESTED_PROMPTS } from './types';

interface ChatModeProps {
  onError: (message: string) => void;
}

export const ChatMode: React.FC<ChatModeProps> = ({ onError }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleSuggestionClick = (text: string) => {
    setChatInput(text);
  };

  const handleChatSend = async (textOverride?: string) => {
    const textToSend = textOverride || chatInput;
    if (!textToSend.trim() || isChatLoading) return;

    setChatInput('');
    setIsChatLoading(true);

    // Optimistic UI
    setMessages((prev) => [...prev, { role: 'user', text: textToSend }]);
    setMessages((prev) => [...prev, { role: 'model', text: '' }]);

    scrollToBottom();

    try {
      if (isThinkingMode) {
        // Thinking Mode (2.5 Pro)
        const responseText = await getThinkingResponse(textToSend);
        setMessages((prev) => {
          const newArr = [...prev];
          newArr[newArr.length - 1] = { role: 'model', text: responseText };
          return newArr;
        });
      } else {
        // Standard Streaming
        const stream = getGeminiChatStream(textToSend);
        let fullText = '';
        for await (const chunk of stream) {
          fullText += chunk;
          setMessages((prev) => {
            const newArr = [...prev];
            newArr[newArr.length - 1] = { role: 'model', text: fullText };
            return newArr;
          });
          // Auto-scroll if near bottom
          if (chatEndRef.current) {
            const parent = chatEndRef.current.parentElement;
            if (parent && parent.scrollHeight - parent.scrollTop - parent.clientHeight < 200) {
              chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }
        }
      }
    } catch {
      onError('Ошибка соединения');
      setMessages((prev) => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = { role: 'model', text: 'Ошибка соединения.' };
        return newArr;
      });
    } finally {
      setIsChatLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-0 animate-in fade-in duration-700">
            <div className="w-16 h-16 bg-brand-mint/30 rounded-full flex items-center justify-center mb-4 text-brand-green">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif text-brand-text mb-2">Намасте!</h3>
            <p className="text-stone-400 text-sm mb-8 max-w-xs">
              Я ваш персональный AI-помощник. Спросите меня о йоге, технике асан или философии.
            </p>

            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="bg-stone-50 hover:bg-brand-green/10 hover:text-brand-green border border-stone-100 text-stone-500 text-xs px-4 py-2 rounded-full transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                msg.role === 'user'
                  ? 'bg-brand-green text-white rounded-br-none'
                  : 'bg-[#F8F9FA] text-stone-700 rounded-bl-none border border-stone-100'
              }`}
            >
              {msg.role === 'model' &&
              msg.text === '' &&
              isChatLoading &&
              idx === messages.length - 1 ? (
                <div className="flex gap-1.5 items-center py-2 px-1">
                  <div
                    className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <div
                    className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              ) : (
                <FormattedText text={msg.text} />
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Thinking Mode Toggle */}
      <div className="px-4 py-2 bg-white flex justify-end">
        <button
          onClick={() => setIsThinkingMode(!isThinkingMode)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            isThinkingMode
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-sm'
              : 'bg-stone-50 border-stone-100 text-stone-400'
          }`}
        >
          <Brain className={`w-3.5 h-3.5 ${isThinkingMode ? 'animate-pulse' : ''}`} />
          Thinking Mode (Beta)
        </button>
      </div>

      <div className="p-4 bg-white">
        <div
          className={`relative flex items-center gap-2 bg-stone-50 rounded-full px-2 py-2 border transition-all ${
            isThinkingMode
              ? 'border-indigo-200 focus-within:ring-4 focus-within:ring-indigo-100'
              : 'border-stone-100 focus-within:ring-4 focus-within:ring-brand-green/5'
          }`}
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
            placeholder={isThinkingMode ? 'Задайте сложный вопрос...' : 'Задайте вопрос...'}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 placeholder:text-stone-400"
          />
          <button
            onClick={() => handleChatSend()}
            disabled={!chatInput.trim() || isChatLoading}
            className={`p-2.5 text-white rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg ${
              isThinkingMode
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                : 'bg-brand-green hover:bg-brand-green/90 shadow-brand-green/20'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
