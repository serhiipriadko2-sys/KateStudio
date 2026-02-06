import { MessageCircle, Sparkles, Trash2, X } from 'lucide-react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { useChatSession } from './useChatSession';

export const ChatWidgetShell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    mode,
    messages,
    setMessages,
    inputValue,
    setInputValue,
    isLoading,
    loadingText,
    isRecording,
    handleSend,
    handleFileUpload,
    startRecordingDiary,
    stopRecordingDiary,
  } = useChatSession();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useLayoutEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, isLoading, mode]);

  const toggleAudio = (index: number) => {
    const msg = messages[index];
    if (playingMessageId === index) {
      audioRef.current?.pause();
      setPlayingMessageId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    if (msg.audioBase64) {
      const audio = new Audio('data:audio/mp3;base64,' + msg.audioBase64);
      audioRef.current = audio;
      setPlayingMessageId(index);
      audio.play();
      audio.onended = () => setPlayingMessageId(null);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-3rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200 h-[80vh] sm:h-[650px]">
          <div className="bg-brand-green p-3 text-white shadow-md z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-accent" />
                <span className="font-medium">Ассистент</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setMessages([])}
                  className="p-2 hover:bg-white/10 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:text-brand-accent p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <>
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              loadingText={loadingText}
              playingMessageId={playingMessageId}
              onToggleAudio={toggleAudio}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput
              mode={mode}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={() => void handleSend()}
              isLoading={isLoading}
              fileInputRef={fileInputRef}
              onFileUpload={handleFileUpload}
              isRecording={isRecording}
              onToggleRecording={() => {
                if (isRecording) stopRecordingDiary();
                else void startRecordingDiary();
              }}
            />
          </>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 bg-brand-green text-brand-accent hover:bg-brand-green/90 p-4 rounded-full shadow-2xl transition-all hover:scale-105"
      >
        <span className={`${isOpen ? 'hidden' : 'hidden sm:block'} font-medium pr-1`}>
          Ассистент
        </span>
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  );
};
