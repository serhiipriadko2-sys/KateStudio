import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { useEffect, useRef, useState } from 'react';
import { getGeminiChatResponse, generateSpeech } from '../../services/geminiService';
import type { ChatMessage } from '../../types';
import { createPcmBlob, decodeAudioData, decodeBase64 } from './liveAudio';

const DEFAULT_WELCOME_MSG: ChatMessage = {
  role: 'model',
  text: 'Здравствуйте! Я ваш помощник по студии "К себе". Подсказать расписание или стоимость?',
};

interface UseChatSessionOptions {
  allowClientFallback: boolean;
  isOpen: boolean;
  userLocation?: { lat: number; lng: number };
}

export const useChatSession = ({
  allowClientFallback,
  isOpen,
  userLocation,
}: UseChatSessionOptions) => {
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
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<unknown> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    sessionStorage.setItem('ksebe_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    return () => {
      void stopLiveSession();
    };
  }, []);

  useEffect(() => {
    if (!isLiveMode) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLiveMode]);

  const resetMessages = () => {
    setMessages([DEFAULT_WELCOME_MSG]);
    sessionStorage.removeItem('ksebe_chat_history');
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

  const startLiveSession = async () => {
    await stopLiveSession();

    setIsLiveMode(true);
    setLiveError(null);
    if (!allowClientFallback) {
      setLiveError('Live-сессия доступна только в режиме разработки.');
      return;
    }
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

  return {
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
  };
};
