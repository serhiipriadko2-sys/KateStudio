import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MessageCircle, Phone, Shield, Sparkles, Trash2, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { getGeminiChatResponse, generateSpeech } from '../../services/geminiService';
import type { ChatMessage } from '../../types';
import {
  defaultConsents,
  loadConsents,
  saveConsents,
  type ConsentKey,
  type ConsentState,
} from '../../utils/consent';
import { ChatInputPanel } from './ChatInputPanel';
import { ChatMessagesPanel } from './ChatMessagesPanel';
import { ConsentModal } from './ConsentModal';
import { ConsentSettingsModal } from './ConsentSettingsModal';
import { createPcmBlob, decodeAudioData, decodeBase64 } from './liveAudio';
import { LiveModePanel } from './LiveModePanel';

const DEFAULT_WELCOME_MSG: ChatMessage = {
  role: 'model',
  text: 'Здравствуйте! Я ваш помощник по студии "К себе". Подсказать расписание или стоимость?',
};

interface ChatWidgetProps {
  hidden?: boolean;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ hidden = false }) => {
  const clientApiKey = import.meta.env.DEV
    ? (import.meta.env.VITE_GEMINI_API_KEY as string | undefined)
    : undefined;
  const allowClientFallback = import.meta.env.DEV && !!clientApiKey;
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [consents, setConsents] = useState<ConsentState>(() => loadConsents());
  const [consentRequest, setConsentRequest] = useState<ConsentKey | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

  // Load initial state from session storage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('ksebe_chat_history');
      return saved ? JSON.parse(saved) : [DEFAULT_WELCOME_MSG];
    } catch {
      return [DEFAULT_WELCOME_MSG];
    }
  });

  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(
    undefined
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Live API Refs
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  // Refs for cleanup
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<unknown> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Listen for custom open event
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setIsOpen(true);
      if (detail && detail.message) {
        setInputValue(detail.message);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    window.addEventListener('ksebe-open-chat', handleOpenChat);
    return () => window.removeEventListener('ksebe-open-chat', handleOpenChat);
  }, []);

  // Init Location
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

  // Persist messages
  useEffect(() => {
    sessionStorage.setItem('ksebe_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    saveConsents(consents);
  }, [consents]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      void stopLiveSession();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isLiveMode) scrollToBottom();
  }, [messages, isOpen, isLiveMode]);

  const handleClearHistory = () => {
    setMessages([DEFAULT_WELCOME_MSG]);
    sessionStorage.removeItem('ksebe_chat_history');
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

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    setInputValue('');
    setMessages((prev) => [...prev, { role: 'user', text: message }]);
    setIsLoading(true);

    const response = await getGeminiChatResponse(message, userLocation);

    setMessages((prev) => [
      ...prev,
      { role: 'model', text: response.text, sources: response.sources },
    ]);
    setIsLoading(false);
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

  const playTts = async (index: number, text: string) => {
    const msg = messages[index];
    if (msg.audioBase64) {
      const audio = new Audio('data:audio/mp3;base64,' + msg.audioBase64);
      audio.play();
      return;
    }

    setMessages((prev) => prev.map((m, i) => (i === index ? { ...m, isAudioLoading: true } : m)));
    const audioBase64 = await generateSpeech(text);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === index ? { ...m, isAudioLoading: false, audioBase64: audioBase64 || undefined } : m
      )
    );

    if (audioBase64) {
      const audio = new Audio('data:audio/mp3;base64,' + audioBase64);
      audio.play();
    }
  };

  const handlePlayTts = (index: number, text: string) => {
    if (consents.ai !== 'granted') {
      requestConsent('ai', () => void playTts(index, text));
      return;
    }
    void playTts(index, text);
  };

  const startLiveSession = async () => {
    await stopLiveSession();

    setIsLiveMode(true);
    setLiveError(null);
    if (!allowClientFallback) {
      setLiveError('Live-сессия доступна только в режиме разработки.');
      return;
    }
    if (!clientApiKey) {
      setLiveError('API ключ не найден');
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: clientApiKey });

      // Safari compatibility
      type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
      const AudioContextClass = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
      const inputCtx = new AudioContextClass!({
        sampleRate: 16000,
      });
      const outputCtx = new AudioContextClass!({
        sampleRate: 24000,
      });

      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const inputSource = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);

      const outputNode = outputCtx.createGain();
      const muteNode = inputCtx.createGain();
      muteNode.gain.value = 0;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are a friendly yoga studio assistant named Katya. Keep responses concise and warm. Speak Russian.',
        },
        callbacks: {
          onopen: () => {
            setIsLiveConnected(true);

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createPcmBlob(inputData);
              sessionPromise.then((session) => session.sendRealtimeInput({ media: pcmBlob }));
            };

            inputSource.connect(scriptProcessor);
            scriptProcessor.connect(muteNode);
            muteNode.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              outputNode.connect(ctx.destination);

              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
          },
          onclose: () => {
            setIsLiveConnected(false);
          },
          onerror: () => {
            setLiveError('Ошибка соединения');
          },
        },
      });

      sessionPromiseRef.current = sessionPromise;
    } catch (e) {
      console.error('Failed to start live session', e);
      setLiveError('Нет доступа к микрофону');
    }
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

  const stopLiveSession = async () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      try {
        await inputAudioContextRef.current.close();
      } catch (error) {
        console.warn('Failed to close input audio context', error);
      }
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      try {
        await outputAudioContextRef.current.close();
      } catch (error) {
        console.warn('Failed to close output audio context', error);
      }
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach((s) => {
      try {
        s.stop();
      } catch (error) {
        console.warn('Failed to stop audio source', error);
      }
    });
    sourcesRef.current.clear();

    if (sessionPromiseRef.current) {
      sessionPromiseRef.current.then((session) => {
        const liveSession = session as { close?: () => void };
        if (typeof liveSession?.close === 'function') {
          try {
            liveSession.close();
          } catch (error) {
            console.warn('Failed to close live session', error);
          }
        }
      });
      sessionPromiseRef.current = null;
    }

    setIsLiveConnected(false);
    setIsLiveMode(false);
  };

  if (hidden) return null;

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

  return (
    <div className="fixed bottom-24 md:bottom-6 right-6 z-50 flex flex-col items-end transition-all duration-300 pointer-events-none">
      <div className="pointer-events-auto flex flex-col items-end">
        {isOpen && (
          <div className="mb-4 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-stone-100 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300 origin-bottom-right h-[500px] ring-1 ring-black/5">
            {/* Header */}
            <div className="bg-brand-green/95 backdrop-blur-md p-4 flex items-center justify-between text-white shadow-sm z-10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-full">
                  <Sparkles className="w-4 h-4 text-brand-yellow" />
                </div>
                <span className="font-medium text-sm">Ассистент К себе</span>
              </div>
              <div className="flex items-center gap-1">
                {!isLiveMode && (
                  <>
                    <button
                      onClick={handleClearHistory}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      title="Очистить историю"
                    >
                      <Trash2 className="w-4 h-4 opacity-80" />
                    </button>
                    <button
                      onClick={() => setSettingsOpen(true)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors"
                      title="Настройки согласий"
                    >
                      <Shield className="w-4 h-4 opacity-80" />
                    </button>
                    <button
                      onClick={handleStartLiveSession}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors group relative"
                      title="Голосовой режим"
                    >
                      <Phone className="w-4 h-4 opacity-80" />
                      <span className="absolute top-1 right-1 w-2 h-2 bg-brand-yellow rounded-full animate-pulse border border-brand-green" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (isLiveMode) void stopLiveSession();
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 opacity-80" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            {isLiveMode ? (
              <LiveModePanel
                isLiveConnected={isLiveConnected}
                liveError={liveError}
                onStop={() => void stopLiveSession()}
              />
            ) : (
              <>
                <ChatMessagesPanel
                  messages={messages}
                  isLoading={isLoading}
                  onPlayTts={handlePlayTts}
                  messagesEndRef={messagesEndRef}
                />
                <ChatInputPanel
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

        {/* Floating Action Button */}
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
