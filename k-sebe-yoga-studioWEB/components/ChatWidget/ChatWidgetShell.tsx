import { ArrowLeft, Grid, MessageCircle, Phone, Sparkles, Trash2, X } from 'lucide-react';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { ChatModeSelector } from './ChatModeSelector';
import { LiveModePanel } from './LiveModePanel';
import { TOOLS } from './tools';
import { useChatSession } from './useChatSession';

export const ChatWidgetShell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    mode,
    setMode,
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
    isLiveMode,
    isLiveConnected,
    isLiveSpeaking,
    permissionError,
    setIsLiveMode,
    startLiveSession,
    stopLiveSession,
  } = useChatSession();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useLayoutEffect(() => {
    if (!isLiveMode && isOpen) scrollToBottom();
  }, [messages, isOpen, isLiveMode, isLoading, mode]);

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
                {isMenuOpen ? (
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="hover:bg-white/10 p-1 rounded-full"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <Sparkles className="w-5 h-5 text-brand-accent" />
                )}
                <span className="font-medium">
                  {isMenuOpen
                    ? 'Меню режимов'
                    : TOOLS.find((t) => t.id === mode)?.label || 'Ассистент'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!isLiveMode && !isMenuOpen && (
                  <button
                    onClick={() => setIsMenuOpen(true)}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                )}
                {!isLiveMode && !isMenuOpen && (
                  <button
                    onClick={() => setMessages([])}
                    className="p-2 hover:bg-white/10 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {!isLiveMode && !isMenuOpen && (
                  <button onClick={startLiveSession} className="p-2 hover:bg-white/10 rounded-full">
                    <Phone className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="hover:text-brand-accent p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen ? (
            <ChatModeSelector
              activeMode={mode}
              onSelect={(nextMode) => {
                setMode(nextMode);
                setIsMenuOpen(false);
              }}
            />
          ) : isLiveMode ? (
            <LiveModePanel
              permissionError={permissionError}
              isLiveConnected={isLiveConnected}
              isLiveSpeaking={isLiveSpeaking}
              onStop={() => void stopLiveSession()}
              onBack={() => setIsLiveMode(false)}
            />
          ) : (
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
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
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
