import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
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
import { createPcmBlob, decodeAudioData, decodeBase64 } from './liveAudio';

const DEFAULT_WELCOME_MSG: ChatMessage = {
  role: 'model',
  text: 'Здравствуйте! Я ваш помощник по студии "К себе". Подсказать расписание или стоимость?',
};

export interface ChatWidgetLogicState {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  isLiveMode: boolean;
  isLiveConnected: boolean;
  liveError: string | null;
  messages: ChatMessage[];
  inputValue: string;
  setInputValue: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  isLoading: boolean;
  handleSend: () => Promise<void>;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handlePlayTts: (index: number, text: string) => void;
  handleClearHistory: () => void;
  handleStartLiveSession: () => Promise<void>;
  stopLiveSession: () => Promise<void>;
  consents: ConsentState;
  consentRequest: ConsentKey | null;
  settingsOpen: boolean;
  setSettingsOpen: (value: boolean) => void;
  confirmConsent: (approved: boolean) => Promise<void>;
  requestConsent: (key: ConsentKey, action: () => void, forcePrompt?: boolean) => void;
  updateConsent: (key: ConsentKey, status: ConsentState[ConsentKey]) => void;
  resetConsents: () => void;
  clearGeolocation: () => void;
  consentMeta: Record<ConsentKey, { title: string; description: string }>;
}

interface ChatWidgetLogicProps {
  children: (state: ChatWidgetLogicState) => React.ReactNode;
}

export const ChatWidgetLogic: React.FC<ChatWidgetLogicProps> = ({ children }) => {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [consents, setConsents] = useState<ConsentState>(() => loadConsents());
  const [consentRequest, setConsentRequest] = useState<ConsentKey | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);

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
  const inputRef = useRef<HTMLInputElement>(null);

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
    sessionStorage.setItem('ksebe_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    saveConsents(consents);
  }, [consents]);

  useEffect(() => {
    return () => {
      void stopLiveSession();
    };
  }, []);

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
    if (!process.env.API_KEY) {
      setLiveError('API ключ не найден');
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

  const handleStartLiveSession = async () => {
    if (consents.ai !== 'granted') {
      requestConsent('ai', () => void handleStartLiveSession());
      return;
    }
    if (consents.microphone !== 'granted') {
      requestConsent('microphone', () => void handleStartLiveSession());
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

  const resetConsents = () => {
    setConsents(defaultConsents);
    setUserLocation(undefined);
    showToast('Согласия сброшены', 'info');
  };

  const clearGeolocation = () => {
    setUserLocation(undefined);
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

  return (
    <>
      {children({
        isOpen,
        setIsOpen,
        isLiveMode,
        isLiveConnected,
        liveError,
        messages,
        inputValue,
        setInputValue,
        inputRef,
        isLoading,
        handleSend,
        handleKeyPress,
        handlePlayTts,
        handleClearHistory,
        handleStartLiveSession,
        stopLiveSession,
        consents,
        consentRequest,
        settingsOpen,
        setSettingsOpen,
        confirmConsent,
        requestConsent,
        updateConsent,
        resetConsents,
        clearGeolocation,
        consentMeta,
      })}
    </>
  );
};
