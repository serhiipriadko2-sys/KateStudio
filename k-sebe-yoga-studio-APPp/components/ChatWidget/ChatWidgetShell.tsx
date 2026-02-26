import { MessageCircle, Mic, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  defaultConsents,
  loadConsents,
  saveConsents,
  type ConsentKey,
  type ConsentState,
} from '../../utils/consent';
import { ChatInput } from './ChatInput';
import { ChatMessages } from './ChatMessages';
import { ChatModeSelector } from './ChatModeSelector';
import { ConsentModal } from './ConsentModal';
import { ConsentSettingsModal } from './ConsentSettingsModal';
import { LiveModePanel } from './LiveModePanel';
import { useChatSession } from './useChatSession';

interface ChatWidgetProps {
  hidden?: boolean;
}

export const ChatWidgetShell: React.FC<ChatWidgetProps> = ({ hidden = false }) => {
  const allowClientFallback = import.meta.env.DEV;
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [consents, setConsents] = useState<ConsentState>(() => loadConsents());
  const [consentRequest, setConsentRequest] = useState<ConsentKey | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(
    undefined
  );
  const pendingActionRef = useRef<(() => void) | null>(null);

  const {
    inputRef,
    inputValue,
    isLiveConnected,
    isLiveMode,
    isLoading,
    liveError,
    messages,
    messagesEndRef,
    playTts,
    resetMessages,
    sendMessage,
    setInputValue,
    startLiveSession,
    stopLiveSession,
  } = useChatSession({
    allowClientFallback,
    isOpen,
    userLocation,
  });

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message?: string } | undefined;
      setIsOpen(true);
      if (detail?.message) {
        setInputValue(detail.message);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    window.addEventListener('ksebe-open-chat', handleOpenChat);
    return () => window.removeEventListener('ksebe-open-chat', handleOpenChat);
  }, [inputRef, setInputValue]);

  useEffect(() => {
    if (consents.geolocation !== 'granted') return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setConsents((prev) => ({ ...prev, geolocation: 'denied' }));
          showToast('Доступ к геолокации запрещен', 'warning');
        }
      }
    );
  }, [consents.geolocation, showToast]);

  useEffect(() => {
    saveConsents(consents);
  }, [consents]);

  const handleClearHistory = () => {
    resetMessages();
    showToast('История переписки очищена', 'info');
  };

  const updateConsent = (key: ConsentKey, status: ConsentState[ConsentKey]) => {
    setConsents((prev) => ({ ...prev, [key]: status }));
  };

  const requestConsent = (key: ConsentKey, action: () => void, forcePrompt = false) => {
    if (consents[key] === 'granted') {
      action();
      return;
    }
    if (consents[key] === 'denied' && !forcePrompt) {
      showToast('Доступ запрещен. Измените настройки согласий.', 'warning');
      setSettingsOpen(true);
      return;
    }
    pendingActionRef.current = action;
    setConsentRequest(key);
  };

  const confirmConsent = async (approved: boolean) => {
    if (!consentRequest) return;
    const key = consentRequest;
    setConsentRequest(null);
    if (!approved) {
      updateConsent(key, 'denied');
      showToast('Согласие не предоставлено', 'info');
      return;
    }
    updateConsent(key, 'granted');
    if (key === 'microphone') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch {
        updateConsent(key, 'denied');
        showToast('Не удалось получить доступ к микрофону', 'warning');
        return;
      }
    }
    if (key === 'geolocation') {
      if (!navigator.geolocation) {
        updateConsent(key, 'denied');
        showToast('Геолокация недоступна в этом браузере', 'warning');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) =>
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => {
          updateConsent(key, 'denied');
          showToast('Не удалось получить доступ к геолокации', 'warning');
        }
      );
    }
    pendingActionRef.current?.();
    pendingActionRef.current = null;
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    if (consents.ai !== 'granted') {
      requestConsent('ai', () => void sendMessage(inputValue));
      return;
    }
    await sendMessage(inputValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') void handleSend();
  };

  const handlePlayTts = (index: number, text: string) => {
    if (consents.ai !== 'granted') {
      requestConsent('ai', () => void playTts(index, text));
      return;
    }
    void playTts(index, text);
  };

  const handleStartLiveSession = async (options?: { skipAi?: boolean; skipMic?: boolean }) => {
    if (!options?.skipAi && consents.ai !== 'granted') {
      requestConsent('ai', () => void handleStartLiveSession({ skipAi: true }));
      return;
    }
    if (!options?.skipMic && consents.microphone !== 'granted') {
      requestConsent('microphone', () => void handleStartLiveSession({ skipMic: true }));
      return;
    }
    await startLiveSession();
  };

  const consentMeta: Record<ConsentKey, { title: string; description: string }> = {
    ai: {
      title: 'Доступ к AI',
      description: 'Мы будем отправлять ваши сообщения в AI-сервис, чтобы дать персональный ответ.',
    },
    microphone: {
      title: 'Доступ к микрофону',
      description: 'Нужен для голосового общения с ассистентом.',
    },
    geolocation: {
      title: 'Доступ к геолокации',
      description: 'Поможет дать подсказки по расписанию и локации студии.',
    },
  };

  if (hidden) return null;

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        {isOpen && (
          <div className="mb-4 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right h-[500px] ring-1 ring-black/5">
            <ChatModeSelector
              isLiveMode={isLiveMode}
              onClearHistory={handleClearHistory}
              onOpenSettings={() => setSettingsOpen(true)}
              onStartLive={() => void handleStartLiveSession()}
              onClose={() => {
                setIsOpen(false);
                if (isLiveMode) void stopLiveSession();
              }}
            />

            {isLiveMode ? (
              <LiveModePanel
                isLiveConnected={isLiveConnected}
                liveError={liveError}
                onStop={() => void stopLiveSession()}
              />
            ) : (
              <>
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  onPlayTts={handlePlayTts}
                  messagesEndRef={messagesEndRef}
                />
                <ChatInput
                  inputRef={inputRef}
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={() => void handleSend()}
                  onKeyDown={handleKeyPress}
                  isLoading={isLoading}
                />
              </>
            )}
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
                group flex items-center gap-3 pl-5 pr-2 py-2 rounded-full shadow-[0_8px_30px_rgba(87,167,115,0.25)] transition-all hover:scale-105 active:scale-95
                ${isOpen ? 'bg-stone-100 text-stone-500' : isLiveMode ? 'bg-rose-500 text-white animate-pulse' : 'bg-brand-green text-white'}
            `}
        >
          <span className={`${isOpen ? 'hidden' : 'hidden sm:block'} font-medium text-sm pr-2`}>
            {isLiveMode ? 'Микрофон активен' : 'Ассистент'}
          </span>
          <div className={`p-2 rounded-full ${isOpen ? 'bg-white' : 'bg-white/20'}`}>
            {isOpen ? (
              <X className="w-5 h-5 text-stone-500" />
            ) : isLiveMode ? (
              <Mic className="w-5 h-5 animate-bounce" />
            ) : (
              <MessageCircle className="w-5 h-5" />
            )}
          </div>
          {!isOpen && !isLiveMode && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-yellow opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-yellow" />
            </span>
          )}
        </button>
      </div>

      {consentRequest && (
        <ConsentModal
          consentKey={consentRequest}
          meta={consentMeta[consentRequest]}
          onApprove={() => void confirmConsent(true)}
          onDeny={() => void confirmConsent(false)}
        />
      )}

      {settingsOpen && (
        <ConsentSettingsModal
          consents={consents}
          consentMeta={consentMeta}
          onClose={() => setSettingsOpen(false)}
          onReset={() => {
            setConsents(defaultConsents);
            setUserLocation(undefined);
            showToast('Согласия сброшены', 'info');
          }}
          onRequest={(key) => requestConsent(key, () => null, true)}
          onDeny={(key) => {
            updateConsent(key, 'denied');
            if (key === 'microphone') void stopLiveSession();
            if (key === 'geolocation') setUserLocation(undefined);
          }}
        />
      )}
    </div>
  );
};
