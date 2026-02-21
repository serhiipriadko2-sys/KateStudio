import { useEffect, useRef, useState } from 'react';
import { getAssistantResponse } from '../../services/assistantService';
import { generateSpeech } from '../../services/geminiService';
import type { ChatMessage } from '../../types';
import { chatCapabilities } from './chatCapabilities';

const DEFAULT_WELCOME_MSG: ChatMessage = {
  role: 'model',
  text: 'Здравствуйте! Я ваш помощник по студии "К себе". Подсказать расписание или стоимость?',
};

interface UseChatSessionOptions {
  isOpen: boolean;
  userLocation?: { lat: number; lng: number };
}

export const useChatSession = ({ isOpen, userLocation }: UseChatSessionOptions) => {
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

  useEffect(() => {
    sessionStorage.setItem('ksebe_chat_history', JSON.stringify(messages));
  }, [messages]);

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

    try {
      const response = await getAssistantResponse(message, userLocation);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: response.text, sources: response.sources },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Не удалось обработать запрос. Попробуйте ещё раз.' },
      ]);
    } finally {
      setIsLoading(false);
    }
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
    if (!chatCapabilities.liveModeEnabled) {
      setIsLiveMode(true);
      setIsLiveConnected(false);
      setLiveError(chatCapabilities.liveModeDisabledReason);
      return;
    }

    setLiveError('Live-сессия включена, но runtime пока не реализован.');
  };

  const stopLiveSession = async () => {
    setIsLiveConnected(false);
    setIsLiveMode(false);
    setLiveError(null);
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
